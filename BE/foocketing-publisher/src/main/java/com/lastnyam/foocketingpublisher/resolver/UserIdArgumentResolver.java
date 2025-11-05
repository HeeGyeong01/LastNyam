package com.lastnyam.foocketingpublisher.resolver;

import com.lastnyam.authentication.service.JwtService;
import com.lastnyam.foocketingpublisher.annotation.UserId;
import com.lastnyam.foocketingpublisher.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * @UserId 어노테이션이 붙은 파라미터에 userId를 주입하는 ArgumentResolver
 * JWT 토큰에서 직접 userId를 추출합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserIdArgumentResolver implements HandlerMethodArgumentResolver {

    private final JwtService jwtService;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(UserId.class) &&
               parameter.getParameterType().equals(Integer.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) throws Exception {
        
        HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);
        if (request == null) {
            throw new IllegalStateException("HttpServletRequest를 찾을 수 없습니다.");
        }

        // Authorization 헤더에서 토큰 추출
        String token = extractTokenFromRequest(request);
        
        if (token == null) {
            throw new UnauthorizedException("JWT 토큰이 없습니다.");
        }

        // 토큰 검증
        if (!jwtService.validateToken(token)) {
            throw new UnauthorizedException("유효하지 않은 JWT 토큰입니다.");
        }

        // Claim에서 userId 추출
        Integer userId = jwtService.getClaimsFromToken(token).getId();
        
        if (userId == null) {
            throw new UnauthorizedException("JWT 토큰에서 userId를 추출할 수 없습니다.");
        }

        return userId;
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

