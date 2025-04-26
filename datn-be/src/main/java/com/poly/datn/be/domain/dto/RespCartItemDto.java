package com.poly.datn.be.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class RespCartItemDto {
    private Long id;
    private String image;
    private String name;
    private Integer size;
    private Double price;
    private Integer quantity;
    private Integer stock;
    private Integer discount;
    private Double lastPrice;
}
