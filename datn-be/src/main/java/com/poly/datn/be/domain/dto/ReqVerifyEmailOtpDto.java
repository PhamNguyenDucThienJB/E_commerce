package com.poly.datn.be.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReqVerifyEmailOtpDto {
    @NotBlank(message = "Mã OTP không được để trống")
    private String otp;
    
    @NotBlank(message = "Loại OTP không được để trống")
    private String type; // "old" hoặc "new"
} 