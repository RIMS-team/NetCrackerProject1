package com.xvitcoder.springmvcangularjs.dao.impl;

import com.xvitcoder.springmvcangularjs.dao.InventStatusDao;
import com.xvitcoder.springmvcangularjs.dao.Mappers.InventStatusMapper;
import com.xvitcoder.springmvcangularjs.model.InventStatus;
import org.apache.log4j.Logger;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import javax.sql.DataSource;
import java.util.List;
import java.util.Locale;

/**
 * Created by dell on 08-Dec-16.
 */
public class JdbcInventStatus implements InventStatusDao {

    private Logger logger = Logger.getLogger(JdbcInventStatus.class);

    private JdbcTemplate jdbcTemplateObject;
    private PlatformTransactionManager transactionManager;
    private TransactionStatus status;

    public void setDataSource(DataSource dataSource) {
        this.jdbcTemplateObject = new JdbcTemplate(dataSource);
    }

    public void setTransactionManager(PlatformTransactionManager transactionManager) {
        Locale.setDefault(Locale.ENGLISH);
        this.transactionManager = transactionManager;
        this.status = transactionManager.getTransaction(new DefaultTransactionDefinition());
    }

    @Override
    public List<InventStatus> findAll() {
        logger.debug("Entering findAll()");
        List<InventStatus> inventStatusList;
        try {
            String sql =
                    "SELECT T.ID, T.CODE, T.NAME " +
                            "FROM LISTTYPE T " +
                            " WHERE T.ATTRTYPE_CODE = 'INV_STATUS' ";

            inventStatusList = jdbcTemplateObject.query(sql, new InventStatusMapper());
        }catch (DataAccessException e) {
            logger.error("Error in select status records, rolling back", e);
            transactionManager.rollback(status);
            throw e;
        }
//        System.out.println("DAO - Inventory Status");
//        for (InventStatus x : inventStatusList){
//            System.out.println(x.toString());
//        }
        logger.debug("Leaving findAll():" + inventStatusList);
        return inventStatusList;
    }

    @Override
    public InventStatus findById(int id) {
        logger.debug("Entering findById(id=" + id + ")");
        InventStatus inventStatus;
        try {
            String sql =
                    "select t.id, t.code, t.name " +
                            "from listtype t " +
                            " where t.attrtype_code = 'INV_STATUS' " +
                            "and t.id = ? " ;
            inventStatus = jdbcTemplateObject.queryForObject(sql, new Object[]{id}, new InventStatusMapper());
        }catch (DataAccessException e) {
            logger.error("Error in select status record, rolling back", e);
            transactionManager.rollback(status);
            throw e;
        }
        logger.debug("Leaving findById():" + inventStatus);
        return inventStatus;
    }

}
