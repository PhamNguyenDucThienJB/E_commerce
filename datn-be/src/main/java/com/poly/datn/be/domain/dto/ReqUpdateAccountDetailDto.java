package com.poly.datn.be.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReqUpdateAccountDetailDto {
    private Long id;
    private String fullname;
    private String gender;
    private String phone;
    private String email;
    private String address;
}
