package com.poly.datn.be.config;


public class Config {
    public static final String vnp_Returnurl = "https://yourwebsite.com/payment-return";
    public static final String vnp_HashSecret = "QUKDKKNOATQJURXAADEBNAZDBMVVOSPF";
    public static final String vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public static final String vnp_TmnCode = "TC59NATY"; // Điền mã TmnCode do VNPAY cung cấp


    public static String hmacSHA512(String key, String data) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA512");
            mac.init(new javax.crypto.spec.SecretKeySpec(key.getBytes(), "HmacSHA512"));
            byte[] hash = mac.doFinal(data.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo HMAC SHA512", e);
        }
    }
}

