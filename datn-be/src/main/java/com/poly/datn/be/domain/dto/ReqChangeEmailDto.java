package com.poly.datn.be.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReqChangeEmailDto {
    @NotBlank(message = "Email mới không được để trống")
    @Email(message = "Email mới không hợp lệ")
    private String newEmail;
} 