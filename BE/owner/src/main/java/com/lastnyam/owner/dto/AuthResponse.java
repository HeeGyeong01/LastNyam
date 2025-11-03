package com.lastnyam.owner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String accessToken;
    private String refreshToken;
    private String message;
    
    public static AuthResponse success(String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .message("인증 성공")
                .build();
    }
    
    public static AuthResponse success(String message) {
        return AuthResponse.builder()
                .message(message)
                .build();
    }
    
    public static AuthResponse registerSuccess(String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .message("회원원가입 성공")
                .build();
    }
}
