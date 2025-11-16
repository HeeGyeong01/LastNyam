package com.lastnyam.customer.security.handler;

import com.lastnyam.authentication.enums.UserRole;
import com.lastnyam.authentication.provider.JwtProvider;
import com.lastnyam.customer.security.service.CustomOAuth2User;
import com.lastnyam.redis.service.RedisService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * OAuth2 인증 성공 시 JWT 토큰을 생성하고 프론트엔드로 리다이렉트
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final String VERSION_KEY_PREFIX = "token_version:customer:";

    private final JwtProvider jwtProvider;
    private final RedisService redisService;

    @Value("${frontend.oauth2.redirect-url}")
    private String redirectUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        Integer userId = oAuth2User.getUserId();
        boolean isNewUser = oAuth2User.isNewUser();

        String userRoleString = oAuth2User.getRole();
        UserRole userRole = UserRole.valueOf(userRoleString);

        // 프론트엔드로 리다이렉트 URL 빌더 생성
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(redirectUrl)
                .queryParam("userId", userId)
                .queryParam("isNewUser", isNewUser); // 최초 로그인 여부 전달

        // isNewUser가 false인 경우에만 토큰 생성 및 전달
        if (!isNewUser) {
            // 사용자별 버전 초기화
            Long initialVersion = initializeTokenVersion(userId);

            // JWT 토큰 생성
            String accessToken = jwtProvider.generateAccessToken(
                    userRole,
                    userId,
                    initialVersion.toString());
            String refreshToken = jwtProvider.generateRefreshToken(
                    userRole,
                    userId,
                    initialVersion.toString());

            log.info("OAuth2 로그인 성공: userId={}, role={}, version={}, isNewUser={}, accessToken 생성 완료",
                    userId, userRole, initialVersion, isNewUser);

            // 토큰을 쿼리 파라미터로 추가
            uriBuilder.queryParam("accessToken", accessToken)
                    .queryParam("refreshToken", refreshToken);
        } else {
            log.info("OAuth2 로그인 성공 (신규 사용자): userId={}, role={}, isNewUser={}, 토큰 미생성",
                    userId, userRole, isNewUser);
        }

        String targetUrl = uriBuilder.build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    /**
     * 사용자별 토큰 버전 초기화
     * Redis에 버전이 없으면 1로 초기화, 있으면 기존 값 유지
     */
    private Long initializeTokenVersion(Integer userId) {
        String versionKey = VERSION_KEY_PREFIX + userId;
        Object storedVersion = redisService.get(versionKey);

        if (storedVersion == null) {
            // 첫 로그인: 버전 1로 초기화
            redisService.add(versionKey, 1L);
            log.debug("토큰 버전 초기화: userId={}, version=1", userId);
            return 1L;
        } else {
            // 이미 버전이 있으면 기존 값 사용 (재발급된 경우)
            try {
                return Long.parseLong(storedVersion.toString());
            } catch (NumberFormatException e) {
                log.error("버전 파싱 실패, 1로 초기화: userId={}", userId);
                redisService.add(versionKey, 1L);
                return 1L;
            }
        }
    }
}
