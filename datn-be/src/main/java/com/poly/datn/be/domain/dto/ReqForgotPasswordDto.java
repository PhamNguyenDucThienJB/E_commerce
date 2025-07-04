package com.poly.datn.be.domain.dto;

import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Data
public class ReqForgotPasswordDto {
    @NotNull
    @NotEmpty
    @Email
    private String email;


}
