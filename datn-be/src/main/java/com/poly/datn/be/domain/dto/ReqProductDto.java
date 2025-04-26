package com.poly.datn.be.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ReqProductDto {
    private String name;
    private String code;
    private String description;
    private Long brandId;
    private Long saleId;
    private Long[] categoryId;
    private String[] imageUrl;
    private ReqAttributeDto[] attribute;
}
