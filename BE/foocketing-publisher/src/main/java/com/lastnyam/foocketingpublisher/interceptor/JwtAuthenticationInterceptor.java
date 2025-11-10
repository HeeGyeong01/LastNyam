package com.lastnyam.foocketingpublisher.interceptor;

import com.lastnyam.authentication.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * JWT 토큰 검증을 위한 Interceptor
 *
 * @UserId 어노테이션이 있는 경우 JWT 검증을 수행합니다. 실제 userId 추출은 ArgumentResolver에서 처리합니다.
 */
@Slf4j
//@Component
@RequiredArgsConstructor
public class JwtAuthenticationInterceptor implements HandlerInterceptor {

    private final JwtService jwtService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        // HandlerMethod가 아닌 경우 통과 (예: 리소스 핸들러)
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        // @UserId 어노테이션이 있는 파라미터가 있는지 확인
        boolean hasUserIdParameter = hasUserIdParameter(handlerMethod);

        if (!hasUserIdParameter) {
            return true;
        }

        // Authorization 헤더에서 토큰 추출
        String token = extractTokenFromRequest(request);

        if (token == null) {
            log.warn("JWT 토큰이 없습니다.");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        // 토큰 검증
        if (!jwtService.validateToken(token)) {
            log.warn("유효하지 않은 JWT 토큰입니다.");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        log.debug("JWT 토큰 검증 완료");

        return true;
    }

    /**
     * HandlerMethod의 파라미터 중 @UserId 어노테이션이 있는지 확인
     */
    private boolean hasUserIdParameter(HandlerMethod handlerMethod) {
        return java.util.Arrays.stream(handlerMethod.getMethodParameters())
                .anyMatch(parameter -> parameter.hasParameterAnnotation(
                        com.lastnyam.foocketingpublisher.annotation.UserId.class));
    }

    /**
     * Authorization 헤더에서 Bearer 토큰 추출
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

