package com.poly.datn.be.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class  RespAccountDto {
    //12 truong
    //account
    private Long id;
    private String username;
    private LocalDate createDate;
    private LocalDate modifyDate;
    private Boolean isActive;
    //role
    private String roleName;
    //account detail
    private String fullName;
    private String gender;
    private String phone;
    private String email;
    private String address;
    @JsonFormat(shape=JsonFormat.Shape.STRING, pattern="yyyy-MM-dd")
    private LocalDate birthDate;
}
