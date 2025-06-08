package com.poly.datn.be.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RespRatingDto {
    private Long id;
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long productId;
    private String productName;
    private Long accountId;
    private String username;
    private String fullname; // Thêm trường fullname
    private String accountAvatar = "https://via.placeholder.com/40"; // Avatar mặc định
    private Long orderId;
    private Boolean isActive;
} 