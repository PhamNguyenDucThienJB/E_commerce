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
                .append("<p style='font-size: 16px;'>Cảm ơn bạn đã đặt hàng tại <b>S&A (Sustainable fashion)</b>! Dưới đây là thông tin đơn hàng của bạn:</p>")
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
        // Cấu hình SMTP
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        // Xác thực Gmail
        Session session = Session.getInstance(props, new javax.mail.Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication("thienpham0712@gmail.com", "neoa yxdj dsme xzbf");
            }
        });

        // Tạo email
        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress("thienpham0712@gmail.com", false));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(order.getEmail()));
        message.setSubject("🎉 Ưu đãi đặc biệt từ S&A - Sustainable Fashion 🎉");
        message.setSentDate(new Date());

        // Soạn nội dung email (giao diện HTML đẹp hơn)
        String content = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>"
                + "<h2 style='color: #4CAF50; text-align: center;'>🎁 ƯU ĐÃI ĐẶC BIỆT DÀNH CHO BẠN 🎁</h2>"
                + "<p style='text-align: center; font-size: 16px;'>Cảm ơn bạn đã đồng hành cùng <strong>S&A - Sustainable Fashion</strong>.</p>"
                + "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;'>"
                + "<p style='font-size: 18px; margin: 10px 0;'><strong>Mã Voucher:</strong> <span style='color: #e91e63; font-size: 24px;'>" + voucher.getCode() + "</span></p>"
                + "<p><strong>Giảm giá:</strong> " + voucher.getDiscount() + "%</p>"
                + "<p><strong>Số lần sử dụng:</strong> " + voucher.getCount() + "</p>"
                + "<p><strong>Hạn sử dụng:</strong> " + voucher.getExpireDate() + "</p>"
                + "</div>"
                + "<div style='text-align: center;'>"
                + "<a href='http://localhost:3000/store' style='background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>"
                + "🛒 Mua sắm ngay"
                + "</a>"
                + "</div>"
                + "<hr style='margin: 30px 0;'/>"
                + "<p style='text-align: center;'>💌 Một lần nữa cảm ơn bạn đã tin tưởng <strong>S&A - Sustainable Fashion</strong>.</p>"
                + "<p style='text-align: center;'>Hẹn gặp lại bạn trong những lần mua sắm tiếp theo!</p>"
                + "</div>";

        message.setContent(content, "text/html; charset=UTF-8");
        message.setSentDate(new Date());
        // Gửi email
        Transport.send(message);
    }


    public static void sendmailForgotPassword(String receiver, String password) throws MessagingException {
        // Cấu hình SMTP
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        // Xác thực Gmail
        Session session = Session.getInstance(props, new javax.mail.Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication("thienpham0712@gmail.com", "neoa yxdj dsme xzbf");
            }
        });

        // Tạo email
        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress("thienpham0712@gmail.com", false));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(receiver));
        message.setSubject("🔐 Cấp Lại Mật Khẩu - S&A (Sustainable Fashion)");
        message.setSentDate(new Date());

        // Soạn nội dung email (HTML chuyên nghiệp)
        String content = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>"
                + "<h2 style='text-align: center; color: #4CAF50;'>🔐 CẤP LẠI MẬT KHẨU</h2>"
                + "<p>Xin chào,</p>"
                + "<p>Bạn đã yêu cầu cấp lại mật khẩu cho tài khoản của mình tại <strong>S&A - Sustainable Fashion</strong>.</p>"
                + "<p style='font-size: 16px;'>Mật khẩu mới của bạn là:</p>"
                + "<div style='text-align: center; margin: 20px 0;'>"
                + "    <span style='display: inline-block; background-color: #f0f0f0; padding: 10px 20px; font-size: 20px; color: #333; border-radius: 5px;'>" + password + "</span>"
                + "</div>"
                + "<p style='color: red;'><strong>Vui lòng đăng nhập và đổi mật khẩu ngay sau khi đăng nhập để đảm bảo an toàn cho tài khoản của bạn.</strong></p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "    <a href='http://localhost:3000/sign-in' style='background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;'>ĐĂNG NHẬP NGAY</a>"
                + "</div>"
                + "<hr/>"
                + "<p style='font-size: 14px; color: gray;'>Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>"
                + "<p style='font-size: 14px; color: gray;'>Nếu cần hỗ trợ, vui lòng liên hệ: <a href='mailto:thienpham0712@gmail.com'>thienpham0712@gmail.com</a></p>"
                + "</div>";

        message.setContent(content, "text/html; charset=UTF-8");

        // Gửi email
        Transport.send(message);
    }


    public static void sendVerificationEmail(String toEmail, String token) throws MessagingException {
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
        msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
        msg.setSubject("📧 Xác minh đăng ký tài khoản - S&A Fashion");

        String verificationLink = "http://localhost:3000/verifyPage?token=" + token;

        String content = "<div style='font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>"
                + "<h3 style='text-align: center;'>📧 Xác minh đăng ký tài khoản</h3>"
                + "<p>Chào bạn,</p>"
                + "<p>Bạn đã đăng ký tài khoản tại <b>S&A Fashion</b>. Vui lòng xác minh email bằng cách nhấn vào liên kết dưới đây:</p>"
                + "<p style='text-align: center;'>"
                + "<a href='" + verificationLink + "' style='background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;'>Xác minh tài khoản</a>"
                + "</p>"
                + "<p style='color: #d9534f; font-weight: bold; text-align: center;'>⚠️ Lưu ý: Liên kết xác minh sẽ hết hạn sau 30 phút kể từ thời điểm gửi.</p>"
                + "<p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>"
                + "<hr style='border: none; border-top: 1px solid #eee;'/>"
                + "<p style='font-size: 12px; color: #888;'>Email này được gửi tự động. Vui lòng không trả lời.</p>"
                + "</div>";


        msg.setContent(content, "text/html; charset=utf-8");
        msg.setSentDate(new Date());

        Transport.send(msg);
    }


}
