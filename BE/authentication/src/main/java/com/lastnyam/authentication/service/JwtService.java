package com.lastnyam.authentication.service;

import com.lastnyam.authentication.dto.TokenDto;
import com.lastnyam.authentication.enums.TokenType;
import com.lastnyam.authentication.enums.UserRole;
import com.lastnyam.authentication.provider.JwtProvider;
import com.lastnyam.redis.service.RedisService;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtProvider jwtProvider;
    private final RedisService redisService;

    public JwtService(JwtProvider jwtProvider, RedisService redisService) {
        this.jwtProvider = jwtProvider;
        this.redisService = redisService;
    }

    public String generateAccessToken(UserRole role, Integer id) {
        return jwtProvider.generateAccessToken(role, id, UUID.randomUUID().toString());
    }

    public String generateRefreshToken(UserRole role, Integer id) {
        return jwtProvider.generateRefreshToken(role, id, UUID.randomUUID().toString());
    }

    public void blacklistToken(String token, TokenType type) {
        TokenDto dto = getClaimsFromToken(token);
        String version = extractVersionOf(token);

        String key = type.getPrefix() + dto.getId() + ":" + version;

        Instant expiration = jwtProvider.getExpiration(token).toInstant();
        Instant now = Instant.now();

        long duration = Duration.between(now, expiration).toMillis();

        if (duration <= 0) {
            return;
        }

        redisService.add(key, true, Duration.ofMillis(duration));
    }

    public boolean validateToken(String token) {
        // 1차 검증: 서명 및 만료 시간 확인
        if (!jwtProvider.validate(token)) {
            return false;
        }

        // 2차 검증: 블랙 리스트 확인
        return !isBlacklisted(token);
    }

    public boolean isBlacklisted(String token) {
        String tokenVersion = jwtProvider.extractVersion(token);
        return redisService.exist(tokenVersion);
    }

    public TokenDto getClaimsFromToken(String token) {
        Integer id = jwtProvider.extractId(token);
        UserRole role = jwtProvider.extractRole(token);

        return TokenDto.builder()
                .id(id)
                .role(role)
                .build();
    }

    public String extractVersionOf(String token) {
        return jwtProvider.extractVersion(token);
    }
}
