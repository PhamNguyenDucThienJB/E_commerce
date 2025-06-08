package com.poly.datn.be.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReqCommentDto {
    @NotNull(message = "Sản phẩm không được để trống")
    private Long productId;
    
    @NotBlank(message = "Nội dung bình luận không được để trống")
    @Size(min = 1, max = 1000, message = "Nội dung bình luận phải từ 1 đến 1000 ký tự")
    private String content;
    
    private Long parentCommentId; // Null nếu là comment gốc, có giá trị nếu là reply
} 