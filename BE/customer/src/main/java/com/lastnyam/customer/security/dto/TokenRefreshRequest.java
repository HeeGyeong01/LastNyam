package com.lastnyam.customer.security.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Refresh Token을 이용한 Access Token 재발급 요청 DTO
 */
@Getter
@NoArgsConstructor
public class TokenRefreshRequest {
    private String refreshToken;
}