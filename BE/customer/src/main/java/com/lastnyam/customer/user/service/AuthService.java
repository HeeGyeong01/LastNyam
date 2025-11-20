package com.lastnyam.customer.user.service;

import com.lastnyam.authentication.provider.JwtProvider;
import com.lastnyam.authentication.service.JwtService;
import com.lastnyam.redis.service.RedisService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;


@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String VERSION_KEY_PREFIX = "token_version:customer:";
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final JwtProvider jwtProvider;
    private final RedisService redisService;

    /**
     * 로그아웃 처리
     *
     * @param request HTTP 요청
     * @return 로그아웃 성공 여부
     */
    @Transactional
    public boolean logout(HttpServletRequest request) {
        log.info("사용자 로그아웃 요청");

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("인증되지 않은 사용자의 로그아웃 요청");
                return false;
            }

            String userIdString = authentication.getName();
            Integer userId = Integer.parseInt(userIdString);

            // 요청 헤더에서 토큰 추출
            String token = resolveToken(request);

            if (StringUtils.hasText(token) && jwtService.validateToken(token)) {
                // 현재 토큰의 버전을 블랙리스트에 추가
                String tokenVersion = jwtProvider.extractVersion(token);
                redisService.add(tokenVersion, "blacklisted");
                log.debug("토큰 버전 블랙리스트 추가: version={}", tokenVersion);

                // 사용자별 토큰 버전 증가 (기존 토큰들 무효화)
                incrementTokenVersion(userId);

                log.info("사용자 로그아웃 완료: userId={}", userId);
                return true;
            } else {
                log.warn("유효하지 않은 토큰으로 로그아웃 요청: userId={}", userId);
                // 토큰이 유효하지 않아도 버전은 증가
                incrementTokenVersion(userId);
                return false;
            }

        } catch (Exception e) {
            log.error("로그아웃 처리 중 오류 발생", e);
            return false;
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    /**
     * 사용자별 토큰 버전 증가
     *
     * @param userId 사용자 ID
     */
    private void incrementTokenVersion(Integer userId) {
        String versionKey = VERSION_KEY_PREFIX + userId;
        Object currentVersion = redisService.get(versionKey);

        Long newVersion;
        if (currentVersion != null) {
            try {
                newVersion = Long.parseLong(currentVersion.toString()) + 1;
            } catch (NumberFormatException e) {
                log.error("버전 파싱 실패, 2로 초기화: userId={}", userId);
                newVersion = 2L;
            }
        } else {
            newVersion = 2L;
        }

        redisService.add(versionKey, newVersion);
        log.debug("토큰 버전 증가: userId={}, 새 버전={}", userId, newVersion);
    }

    /**
     * Request Header에서 토큰 정보 추출
     *
     * @param request HTTP 요청
     * @return JWT 토큰
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
