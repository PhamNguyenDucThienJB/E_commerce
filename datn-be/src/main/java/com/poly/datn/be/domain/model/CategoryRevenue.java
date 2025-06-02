package com.poly.datn.be.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CategoryRevenue {
    private Long categoryId;
    private String categoryName;
    private Double total;
} 