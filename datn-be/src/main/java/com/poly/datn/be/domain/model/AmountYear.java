package com.poly.datn.be.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class AmountYear {
    private Integer year;
    private Long count;
    private Double total;
}
