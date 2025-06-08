package com.poly.datn.be.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReqRatingDto {
    @NotNull(message = "Sản phẩm không được để trống")
    private Long productId;
    
    // orderId can be null for admin replies or updates
    private Long orderId;
    
    @NotNull(message = "Đánh giá không được để trống")
    @Min(value = 1, message = "Đánh giá phải từ 1 đến 5 sao")
    @Max(value = 5, message = "Đánh giá phải từ 1 đến 5 sao")
    private Integer rating;
    
    @Size(max = 1000, message = "Nội dung đánh giá không được vượt quá 1000 ký tự")
    private String content;
} 