package com.poly.datn.be.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class RespProductDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private Long view;
    private Double price;
    private String image;
    private String brand;
    private Integer discount;
    private Boolean isActive;
}
