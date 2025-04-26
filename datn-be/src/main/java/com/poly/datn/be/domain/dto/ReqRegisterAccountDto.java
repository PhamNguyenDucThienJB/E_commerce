package com.poly.datn.be.domain.dto;

import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Data
public class ReqRegisterAccountDto {
    //10 truong
    //account
    @NotNull(message = "Username không null")
    @NotEmpty(message = "Username không trống")
    private String username;
    @NotNull(message = "Password không null")
    @NotEmpty(message = "Password không trống")
    private String password;
    //account detail
    @NotNull(message = "FullName không được null")
    @NotEmpty(message = "FullName không được trống")
    private String fullName;
    @NotNull(message = "Gender không được null")
    @NotEmpty(message = "Gender không được trống")
    private String gender;
    @NotNull(message = "Phone không được null")
    @NotEmpty(message = "Phone không được trống")
    private String phone;
    @NotNull(message = "Email không được null")
    @NotEmpty(message = "Email không được trống")
    private String email;
    @NotNull(message = "Address không được null")
    @NotEmpty(message = "Address không được trống")
    private String address;
}
