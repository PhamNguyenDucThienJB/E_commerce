package com.poly.datn.be.domain.dto;

import com.poly.datn.be.entity.Attribute;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class RespProductDetailDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String main;
    private Integer discount;
    private List<String> images;
    private List<Attribute> attributes;
    private List<Long> category;
    private Long saleId;
    private Long brandId;
    private String brand;
    private Double price;
    private Long view;
}
