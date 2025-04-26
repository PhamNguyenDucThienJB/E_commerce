package com.poly.datn.be.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ResponseProductDto {
    private long id;
    private String name;
    private String code;
    private String description;
    private long view;
    private double price;
    private String image;
    private String brand;
    private int discount;
    private boolean isActive;
}
