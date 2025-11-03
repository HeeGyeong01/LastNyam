package com.lastnyam.owner.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lastnyam.authentication.dto.TokenDto;
import com.lastnyam.authentication.service.JwtService;
import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.redis.service.RedisService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtRefreshFilter extends OncePerRequestFilter {

    private static final String TARGET_URI = "/api/owner/auth/refresh";
    private final JwtService jwtService;

    private final RedisService redisService;
    private final ObjectMapper objectMapper;
    @Value("security.jwt.refresh-token.key")
    private String refreshTokenName;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (!request.getRequestURI().contains(TARGET_URI) || !request.getMethod().equals(HttpMethod.GET.name())) {
            filterChain.doFilter(request, response);
            return;
        }

        String refreshToken = getRefreshToken(request);

        if (refreshToken == null || jwtService.isBlacklisted(refreshToken)) {
            sendFail(response);
            return;
        }
        TokenDto claim = jwtService.getClaimsFromToken(refreshToken);
        String accessToken = getAccessToken(request);

        if (accessToken != null) {
            markInvalidVersion(jwtService.extractVersionOf(accessToken));
        }

        markInvalidVersion(jwtService.extractVersionOf(refreshToken));

        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        reissueToken(response, claim);
    }

    private String getRefreshToken(HttpServletRequest request) {
        for (Cookie cookie : request.getCookies()) {
            if (cookie.getName().equals(refreshTokenName)) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private String getAccessToken(HttpServletRequest request) {
        return request.getHeader(HttpHeaders.AUTHORIZATION);
    }

    private void markInvalidVersion(String version) {
        redisService.add(version, true);
    }

    private void sendFail(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.BAD_REQUEST.value());

        ApiResponse<String> apiResponse = ApiResponse.ofFail(400, "refresh 실패");

        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }

    public void reissueToken(HttpServletResponse response, TokenDto claim) {
        String reIssuedRefreshToken = jwtService.generateRefreshToken(claim.getRole(), claim.getId());
        String reIssuedAccessToken = jwtService.generateAccessToken(claim.getRole(), claim.getId());

        response.setHeader(HttpHeaders.AUTHORIZATION, reIssuedAccessToken);

        Cookie cookie = new Cookie(refreshTokenName, reIssuedRefreshToken);
        response.addCookie(cookie);
    }
}
