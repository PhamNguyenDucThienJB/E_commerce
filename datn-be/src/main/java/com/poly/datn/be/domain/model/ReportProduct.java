package com.poly.datn.be.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ReportProduct {
    private Long id;
    private String name;
    private Double amount;
    private Long quantity;
    private Long count;
}
