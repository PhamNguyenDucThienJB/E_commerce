package com.poly.datn.be.domain.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReqCategoryDto {
    private Long id;
    private String name;
    private String description;
    private LocalDate createDate;
    private LocalDate modifyDate;
    private Boolean isActive;
}
