package com.poly.datn.be.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ReqCartItemDto {
    private Long accountId;
    private Long attributeId;
    private Integer quantity;
    private Double lastPrice;
}
