package com.poly.datn.be.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReqAdminRatingReplyDto {
    @NotNull(message = "Sản phẩm không được để trống")
    private Long productId;
    
    @NotNull(message = "Nội dung trả lời không được để trống")
    @Size(min = 1, max = 1000, message = "Nội dung trả lời phải từ 1 đến 1000 ký tự")
    private String content;
    
    // ID của đánh giá mà admin đang phản hồi
    private Long replyToRatingId;
} 