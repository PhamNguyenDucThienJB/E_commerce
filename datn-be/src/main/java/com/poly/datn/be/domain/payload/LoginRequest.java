package com.poly.datn.be.domain.payload;

import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Data
public class LoginRequest {
    private String email;
    
    private String username;
    
    @NotBlank(message = "Password không được để trống")
    private String password;
    
    private Boolean admin;
}
