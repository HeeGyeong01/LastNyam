package com.lastnyam.owner.security.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lastnyam.authentication.enums.TokenType;
import com.lastnyam.authentication.service.JwtService;
import com.lastnyam.common.dto.ApiResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CustomLogoutSuccessHandler implements LogoutSuccessHandler {

    private final JwtService jwtService;
    private final ObjectMapper objectMapper;


    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException {

        String accessToken = extractAccessTokenFromRequest(request);

        String refreshToken = extractRefreshTokenFromRequest(request);

        if (accessToken == null || refreshToken == null) {
            throw new BadCredentialsException("유효하지 않은 토큰입니다.");
        }

        jwtService.blacklistToken(accessToken, TokenType.OWNER_ACCESS);
        jwtService.blacklistToken(refreshToken, TokenType.OWNER_REFRESH);

        ApiResponse<?> data = ApiResponse.ofSuccess("로그아웃 성공");
        objectMapper.writeValue(response.getWriter(), data);
    }

    private String extractAccessTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private String extractRefreshTokenFromRequest(HttpServletRequest request) {
        for (Cookie cookie : request.getCookies()) {
            if (cookie.getName().equals("Authorization-refresh")) {
                return cookie.getValue();
            }
        }
        return null;
    }

}
