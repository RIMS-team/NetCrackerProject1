package com.xvitcoder.springmvcangularjs.controller;

import com.xvitcoder.springmvcangularjs.mail.EmailSender;
import com.xvitcoder.springmvcangularjs.model.MailSender;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by Admin on 26.01.2017.
 */
@Controller
@RequestMapping("/mail")
public class MailController {
    private Logger logger = Logger.getLogger(MailController.class);

    @RequestMapping(value="/send", method = RequestMethod.POST)
    public @ResponseBody void sendEmail(@RequestBody MailSender email) {
        logger.debug("Request URL: /send; Entering sendEmail(String email,String template)");
        System.out.println(email.getEmail()+" "+email.getTemplate());
        EmailSender emailSender=new EmailSender();
        emailSender.sendMessage("v.karpov2018@yandex.ru","q1w2e3r4t1",email.getEmail(),email.getTemplate());
    }
}
