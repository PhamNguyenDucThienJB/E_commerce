package com.poly.datn.be.domain.dto;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Data
public class ReqChangePasswordDto {
    @NotNull
    @NotEmpty
    private String username;
    @NotNull
    @NotEmpty
    private String password;
    @NotNull
    @NotEmpty
    @Min(6)
    @Max(15)
    private String newPassword;
    @NotNull
    @NotEmpty
    @Min(6)
    @Max(15)
    private String newPasswordSecond;
}
