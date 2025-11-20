package com.lastnyam.customer.security.filter;

import com.lastnyam.authentication.dto.TokenDto;
import com.lastnyam.authentication.provider.JwtProvider;
import com.lastnyam.authentication.service.JwtService;
import com.lastnyam.redis.service.RedisService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String VERSION_KEY_PREFIX = "token_version:customer:";
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private final JwtService jwtService;
    private final JwtProvider jwtProvider;
    private final RedisService redisService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        // JWT 토큰 추출
        String token = resolveToken(request);

        // 토큰 유효성 검증 및 인증 정보 설정
        if (StringUtils.hasText(token) && jwtService.validateToken(token)) {
            TokenDto tokenDto = jwtService.getClaimsFromToken(token);
            Integer userId = tokenDto.getId();

            // 사용자별 버전 검증
            if (!isValidTokenVersion(token, userId)) {
                log.warn("토큰 버전 불일치로 인증 실패: userId={}", userId);
                filterChain.doFilter(request, response);
                return;
            }

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    tokenDto.getId().toString(),
                    null,
                    Collections.singleton(new SimpleGrantedAuthority("ROLE_" + tokenDto.getRole().name())));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.debug("Security Context에 '{}' 인증 정보를 저장했습니다", authentication.getName());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * 토큰 버전 검증 Redis에 저장된 버전과 토큰의 버전을 비교
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
     * Request Header에서 토큰 정보 추출
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
