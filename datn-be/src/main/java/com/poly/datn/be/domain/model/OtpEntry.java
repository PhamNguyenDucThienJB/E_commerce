package com.poly.datn.be.domain.model;
import java.time.LocalDateTime;

public class OtpEntry {
    private String otp;
    private LocalDateTime expiredAt;

    public OtpEntry(String otp, LocalDateTime expiredAt) {
        this.otp = otp;
        this.expiredAt = expiredAt;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiredAt);
    }

    public String getOtp() {
        return otp;
    }
}
