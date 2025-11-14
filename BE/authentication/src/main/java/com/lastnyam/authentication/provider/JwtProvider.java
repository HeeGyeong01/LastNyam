package com.lastnyam.authentication.provider;

import com.lastnyam.authentication.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtProvider {

    @Value("${security.jwt.access-token.expiration}")
    public int ACCESS_TOKEN_EXPIRATION;
    @Value("${security.jwt.refresh-token.expiration}")
    public int REFRESH_TOKEN_EXPIRATION;
    @Value("${security.jwt.secretKey}")
    private String secretKey;
    private SecretKey key;

    @PostConstruct
    void init() {
        byte[] decoded = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(decoded);
    }

    public String generateAccessToken(UserRole role, int id, String version) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer("lastnyam")
                .claim("role", role)
                .claim("id", id)
                .claim("token_version", version)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(ACCESS_TOKEN_EXPIRATION)))
                .id(UUID.randomUUID().toString())
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken(UserRole role, int id, String version) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer("lastnyam")
                .claim("role", role)
                .claim("id", id)
                .claim("token_version", version)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(REFRESH_TOKEN_EXPIRATION)))
                .id(UUID.randomUUID().toString())
                .signWith(key)
                .compact();
    }

    public boolean validate(String rawToken) {
        try {
            Claims c = getClaims(rawToken);
            return c.getExpiration() != null && c.getExpiration().toInstant().isAfter(Instant.now());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UserRole extractRole(String token) {
        String role = getClaims(token).get("role", String.class);
        return UserRole.valueOf(role);
    }

    public Date getExpiration(String token) {
        Claims claims = getClaims(token);
        return claims.getExpiration();
    }

    public Integer extractId(String token) {
        return getClaims(token).get("id", Integer.class);
    }

    public String extractVersion(String token) {
        return getClaims(token).get("token_version", String.class);
    }

}
