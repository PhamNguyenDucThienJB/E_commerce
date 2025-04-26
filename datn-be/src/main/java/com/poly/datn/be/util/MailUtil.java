package com.poly.datn.be.util;

import com.poly.datn.be.entity.Order;
import com.poly.datn.be.entity.Voucher;

import javax.mail.*;
import javax.mail.internet.*;
import java.io.IOException;
import java.util.Base64;
import java.util.Date;
import java.util.Properties;

public class MailUtil {
    public static void sendEmail(Order order) throws MessagingException {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        Session session = Session.getInstance(props, new javax.mail.Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication("thienpham0712@gmail.com", "neoa yxdj dsme xzbf");
            }
        });
        Message msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress("thienpham0712@gmail.com", false));

        msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(order.getEmail()));
        StringBuilder sb = new StringBuilder()
                .append("<div style='font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>")
                .append("<h2 style='color: #333; text-align: center;'>🛍️ Xác nhận đơn hàng</h2>")
                .append("<p style='font-size: 16px;'>Cảm ơn bạn đã đặt hàng tại <b>SneakerHead</b>! Dưới đây là thông tin đơn hàng của bạn:</p>")
                .append("<hr style='border: 1px solid #ddd;'/>")
                .append("<p><b>Đơn hàng:</b> #" + order.getId() + "</p>")
                .append("<p><b>Tổng tiền:</b> " + order.getTotal() + " VNĐ</p>")
                .append("<p><b>Ngày tạo:</b> " + order.getCreateDate() + "</p>")
                .append("<p><b>Người nhận:</b> " + order.getFullname() + "</p>")
                .append("<p><b>SĐT:</b> " + order.getPhone() + "</p>")
                .append("<p><b>Địa chỉ:</b> " + order.getAddress() + "</p>")
                .append("<hr style='border: 1px solid #ddd;'/>")
                .append("<p style='text-align: center;'>📦 <a href='http://localhost:3000/order/detail/"
                        + Base64.getUrlEncoder().encodeToString(String.valueOf(order.getId()).getBytes())
                        + "' style='color: #007bff; text-decoration: none; font-weight: bold;'>Theo dõi trạng thái đơn hàng tại đây</a></p>")
                .append("<p style='text-align: center; font-size: 14px; color: #888;'>Nếu bạn có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi qua email hoặc hotline.</p>")
                .append("</div>");

        msg.setSubject("🛍️ Cửa hàng Thời Trang S&A - Xác nhận đơn hàng #" + order.getId());
        msg.setContent(sb.toString(), "text/html; charset=utf-8");
        msg.setSentDate(new Date());
        Transport.send(msg);

    }

    public static void sendEmail(Voucher voucher, Order order) throws MessagingException {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        Session session = Session.getInstance(props, new javax.mail.Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication("thienpham0712@gmail.com", "neoa yxdj dsme xzbf");
            }
        });
        Message msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress("thienpham0712@gmail.com", false));

        msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(order.getEmail()));
        StringBuilder sb = new StringBuilder()
                .append("Bạn nhận được voucher giảm giá cho lần sử dụng tiếp theo: " + voucher.getCode()).append("<br/>")
                .append("Số lần sử dụng: " + voucher.getCount()).append("<br/>")
                .append("Hạn sử dụng: " + voucher.getExpireDate()).append("<br/>")
                .append("Giảm giá: " + voucher.getDiscount() + " %").append("<br/>");
        msg.setSubject("Cửa hàng giày SneakerHead thông báo");
        msg.setContent(sb.toString(), "text/html; charset=utf-8");
        msg.setSentDate(new Date());
        Transport.send(msg);
    }

    public static void sendmailForgotPassword(String receive, String password) throws MessagingException {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        Session session = Session.getInstance(props, new javax.mail.Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication("thienpham0712@gmail.com", "neoa yxdj dsme xzbf");
            }
        });
        Message msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress("thienpham0712@gmail.com", false));

        msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(receive));
        msg.setSubject("Công Minh Idol thông báo");
        msg.setContent("New Pasword: " + password, "text/html");
        msg.setSentDate(new Date());

        Transport.send(msg);
    }
}
