package com.lastnyam.owner.security.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lastnyam.authentication.enums.UserRole;
import com.lastnyam.authentication.service.JwtService;
import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.common.enums.ApiStatus;
import com.lastnyam.owner.dto.TokenData;
import com.lastnyam.owner.security.entity.CustomUserDetails;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof CustomUserDetails userDetails)) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Invalid principal type");
            return;
        }

        Integer ownerId = userDetails.getOwnerId();
        String accessToken = jwtService.generateAccessToken(UserRole.OWNER, ownerId);
        String refreshToken = jwtService.generateRefreshToken(UserRole.OWNER, ownerId);

        TokenData tokenData = TokenData.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();

        ApiResponse<TokenData> apiResponse = new ApiResponse<>(tokenData, ApiStatus.SUCCESS, 200, "로그인 성공");

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json;charset=UTF-8");
        objectMapper.writeValue(response.getWriter(), apiResponse);
    }
}


