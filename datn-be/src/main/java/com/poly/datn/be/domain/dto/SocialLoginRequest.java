package com.poly.datn.be.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialLoginRequest {
    private String token;        // Google ID token
    private String accessToken;  // Facebook access token
} 