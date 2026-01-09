package com.novelweb.security.jwt;

import com.novelweb.domain.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtProvider {
    private final SecretKey secretKey;
    private final String issuer;
    private final long accessMinutes;

    public JwtProvider(
        @Value("${app.jwt.secret}") String secret,
        @Value("${app.jwt.issuer}") String issuer,
        @Value("${app.jwt.access-minutes}") long accessMinutes
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
        this.accessMinutes = accessMinutes;
    }

    public String generateAccessToken(UUID userId, UUID sessionId, UserRole role) {
        Instant now = Instant.now();
        return Jwts.builder()
            .issuer(issuer)
            .subject(userId.toString())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(accessMinutes * 60)))
            .claim("sid", sessionId.toString())
            .claim("role", role.name())
            .signWith(secretKey)
            .compact();
    }

    public JwtClaims parse(String token) {
        Claims claims = Jwts.parser()
            .verifyWith(secretKey)
            .requireIssuer(issuer)
            .build()
            .parseSignedClaims(token)
            .getPayload();

        UUID userId = UUID.fromString(claims.getSubject());
        UUID sessionId = UUID.fromString(claims.get("sid", String.class));
        UserRole role = UserRole.valueOf(claims.get("role", String.class));
        return new JwtClaims(userId, sessionId, role);
    }
}
