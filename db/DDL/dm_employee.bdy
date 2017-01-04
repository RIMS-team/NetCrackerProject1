﻿CREATE OR REPLACE package body dm_employee is

--=========================================

  procedure employee_select(
        p_object_id      in number,
        p_out_cursor     out sys_refcursor,
        p_full_name_mask in varchar2 default null,
        p_rownum_first   in number default null,   -- pagination
        p_rownum_last    in number default null    -- pagination
  ) as
    l_rownum_first number := p_rownum_first;
  begin
    if l_rownum_first is null then
      l_rownum_first := 1;
    end if;
  
    open p_out_cursor for
      select * from (
        SELECT /*+ first_rows(30) */
               row_number() over (order by EMP.OBJECT_ID) rn,
               EMP.OBJECT_ID AS EMPLOYEE_ID, 
               PHONE_ATTR.VALUE AS PHONE_NUMBER, 
               FNAME_ATTR.VALUE AS FULL_NAME, 
               EMAIL_ATTR.VALUE AS EMAIL
          FROM OBJECTS EMP, ATTRIBUTES FNAME_ATTR, ATTRIBUTES EMAIL_ATTR, ATTRIBUTES PHONE_ATTR
         WHERE EMP.OBJECT_TYPE_ID = 1 /* EMPLOYEE */
           AND EMP.OBJECT_ID = FNAME_ATTR.OBJECT_ID
           AND EMP.OBJECT_ID = EMAIL_ATTR.OBJECT_ID
           AND EMP.OBJECT_ID = PHONE_ATTR.OBJECT_ID
           AND FNAME_ATTR.ATTR_ID = 1 /* FULL_NAME */
           AND EMAIL_ATTR.ATTR_ID = 2 /* EMAIL */
           AND PHONE_ATTR.ATTR_ID = 3 /* PHONE_NUMBER */
           AND (p_object_id is null or EMP.OBJECT_ID = p_object_id)
           AND (p_full_name_mask is null or (length(p_full_name_mask) > 2 and FNAME_ATTR.VALUE like '%' || p_full_name_mask || '%'))
      )
      where  p_rownum_last is null or (rn between l_rownum_first AND p_rownum_last);
  end;
  ----
  procedure employee_insert(
        p_object_id     in out  number,
        p_full_name     in      varchar2,
        p_phone_number  in      varchar2,
        p_email         in      varchar2) as
  begin
    if p_object_id is null then
      p_object_id := seq_objects.nextval;
    end if;
  
    INSERT ALL
      INTO OBJECTS (OBJECT_ID,PARENT_ID,OBJECT_TYPE_ID,NAME,DESCRIPTION) VALUES (p_object_id, NULL, 1, p_full_name, NULL)
      INTO ATTRIBUTES (ATTR_ID, OBJECT_ID, VALUE, DATE_VALUE) VALUES (1, p_object_id, p_full_name, null)
      INTO ATTRIBUTES (ATTR_ID, OBJECT_ID, VALUE, DATE_VALUE) VALUES (2, p_object_id, p_email, null)
      INTO ATTRIBUTES (ATTR_ID, OBJECT_ID, VALUE, DATE_VALUE) VALUES (3, p_object_id, p_phone_number, null)
    SELECT * FROM dual;  
  end;
  ----
  procedure employee_update(
        p_object_id     in number,
        p_full_name     in varchar2,
        p_phone_number  in varchar2,
        p_email         in varchar2) as
  begin
    if p_object_id is null then
      raise_application_error(-20001, 'Не указан id записи для редактирования.');
    end if;
    
    merge into attributes a
    USING(
      select p_object_id as object_id, 1 attr_id /* FULL_NAME */, p_full_name as value from dual union all
      select p_object_id as object_id, 2 attr_id /* EMAIL */, p_email as value from dual union all
      select p_object_id as object_id, 3 attr_id /* PHONE_NUMBER */, p_phone_number as value from dual
    ) t on (a.object_id = t.object_id and a.attr_id = t.attr_id)
    when matched then update set a.value = t.value;
      
    if SQL%ROWCOUNT = 0 then
      raise_application_error(-20001, 'Не найдена запись для редактирования.');
    end if;
  end;
  ----
  procedure employee_delete(p_object_id in number) as
    l_OBJECT_TYPE_ID  number;
  begin
    select o.object_type_id
      into l_OBJECT_TYPE_ID
      from objects o
     where o.object_id = p_object_id;
     
    if l_OBJECT_TYPE_ID <> 1 then
      raise_application_error(-20001, 'Запись не соответствувет типу EMPLOYEE.');
    end if;
  
    delete from attributes
     where object_id = p_object_id;
     
    delete from objects
     where object_id = p_object_id;
     
    if SQL%ROWCOUNT = 0 then
      raise_application_error(-20001, 'Не найдена запись для удаления.');
    end if;
  end;
  
--==========================================================

begin
  -- Initialization
  null;
end dm_employee;


/
