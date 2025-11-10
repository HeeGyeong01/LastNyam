package com.lastnyam.customer.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lastnyam.authentication.dto.TokenDto;
import com.lastnyam.authentication.provider.JwtProvider;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtRefreshFilter extends OncePerRequestFilter {

    private static final String TARGET_URI = "/api/auth/token/refresh";
    private static final String VERSION_KEY_PREFIX = "token_version:customer:";

    private final JwtService jwtService;
    private final JwtProvider jwtProvider;
    private final RedisService redisService;
    private final ObjectMapper objectMapper;

    @Value("${security.jwt.refresh-token.key}")
    private String refreshTokenName;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (!request.getRequestURI().contains(TARGET_URI) || !request.getMethod().equals(HttpMethod.GET.name())) {
            filterChain.doFilter(request, response);
            return;
        }

        String refreshToken = getRefreshToken(request);

        if (refreshToken == null || !jwtService.validateToken(refreshToken)) {
            sendFail(response);
            return;
        }

        TokenDto claim = jwtService.getClaimsFromToken(refreshToken);
        Integer userId = claim.getId();

        // 사용자별 버전 검증
        if (!isValidTokenVersion(refreshToken, userId)) {
            log.warn("토큰 버전 불일치: userId={}", userId);
            sendFail(response);
            return;
        }

        // 버전 증가 및 새 토큰 발급
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        reissueToken(response, claim);
    }

    private String getRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals(refreshTokenName)) {
                return cookie.getValue();
            }
        }
        return null;
    }

    /**
     * 토큰 버전 검증
     * Redis에 저장된 버전과 토큰의 버전을 비교
     */
    private boolean isValidTokenVersion(String token, Integer userId) {
        String tokenVersion = jwtProvider.extractVersion(token);
        String versionKey = VERSION_KEY_PREFIX + userId;

        Object storedVersion = redisService.get(versionKey);

        // Redis에 버전이 없으면 첫 로그인 (유효)
        if (storedVersion == null) {
            return true;
        }

        // 토큰 버전과 Redis 버전 비교
        try {
            Long storedVersionLong = Long.parseLong(storedVersion.toString());
            Long tokenVersionLong = Long.parseLong(tokenVersion);

            // 토큰 버전 >= Redis 버전이면 유효
            return tokenVersionLong >= storedVersionLong;
        } catch (NumberFormatException e) {
            log.error("버전 파싱 실패: userId={}, storedVersion={}, tokenVersion={}",
                    userId, storedVersion, tokenVersion);
            return false;
        }
    }

    /**
     * 사용자별 버전 증가
     */
    private Long incrementTokenVersion(Integer userId) {
        String versionKey = VERSION_KEY_PREFIX + userId;

        Object currentVersion = redisService.get(versionKey);
        Long newVersion;

        if (currentVersion == null) {
            // 첫 로그인: 버전 1부터 시작
            newVersion = 1L;
        } else {
            // 기존 버전에 1 증가
            try {
                newVersion = Long.parseLong(currentVersion.toString()) + 1;
            } catch (NumberFormatException e) {
                log.error("버전 파싱 실패, 1로 초기화: userId={}", userId);
                newVersion = 1L;
            }
        }

        // Redis에 새로운 버전 저장
        redisService.add(versionKey, newVersion);
        log.debug("토큰 버전 증가: userId={}, version={}", userId, newVersion);

        return newVersion;
    }

    private void sendFail(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.BAD_REQUEST.value());
        ApiResponse<String> apiResponse = ApiResponse.ofFail(400, "refresh 실패");
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }

    /**
     * 토큰 재발급 (버전 증가 방식)
     */
    public void reissueToken(HttpServletResponse response, TokenDto claim) {
        Integer userId = claim.getId();

        // 버전 증가
        Long newVersion = incrementTokenVersion(userId);

        // 새 버전으로 토큰 생성
        String reIssuedRefreshToken = jwtProvider.generateRefreshToken(
                claim.getRole(),
                userId,
                newVersion.toString());
        String reIssuedAccessToken = jwtProvider.generateAccessToken(
                claim.getRole(),
                userId,
                newVersion.toString());

        response.setHeader(HttpHeaders.AUTHORIZATION, reIssuedAccessToken);

        Cookie cookie = new Cookie(refreshTokenName, reIssuedRefreshToken);
        response.addCookie(cookie);

        log.info("토큰 재발급 완료: userId={}, version={}", userId, newVersion);
    }
}
