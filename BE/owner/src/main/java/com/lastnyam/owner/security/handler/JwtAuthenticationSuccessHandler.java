package com.lastnyam.owner.security.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lastnyam.authentication.enums.UserRole;
import com.lastnyam.authentication.service.JwtService;
import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.common.enums.ApiStatus;
import com.lastnyam.owner.owner.dto.OwnerDetailResponse;
import com.lastnyam.owner.security.entity.CustomUserDetails;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final ObjectMapper objectMapper;
    @Value("${security.jwt.refresh-token.key}")
    private String refreshTokenName;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof CustomUserDetails userDetails)) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Invalid principal type");
            return;
        }

        Integer ownerId = userDetails.getOwnerId();

        issueToken(response, ownerId);

        OwnerDetailResponse detail = OwnerDetailResponse.builder()
                .ownerId(ownerId)
                .build();

        ApiResponse<?> apiResponse = new ApiResponse<>(detail, ApiStatus.SUCCESS, 200, "로그인 성공");

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json;charset=UTF-8");
        objectMapper.writeValue(response.getWriter(), apiResponse);
    }

    public void issueToken(HttpServletResponse response, Integer id) {
        String reIssuedRefreshToken = jwtService.generateRefreshToken(UserRole.OWNER, id);
        String reIssuedAccessToken = jwtService.generateAccessToken(UserRole.OWNER, id);

        response.setHeader(HttpHeaders.AUTHORIZATION, reIssuedAccessToken);

        Cookie cookie = new Cookie(refreshTokenName, reIssuedRefreshToken);
        response.addCookie(cookie);
    }
}


