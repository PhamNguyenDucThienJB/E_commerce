package com.poly.datn.be.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ReqFilterProduct {
    private Integer page;
    private Integer count;
    private List<Long> category;
    private List<Long> brand;
    private Double min;
    private Double max;
}
