package com.prosneaker.sneakerstore.config.security;

import com.prosneaker.sneakerstore.modules.users.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 characters");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(User user) {
        return buildToken(user, jwtProperties.getExpirationMs(), JwtConstants.ACCESS_TOKEN);
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, jwtProperties.getRefreshExpirationMs(), JwtConstants.REFRESH_TOKEN);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get(JwtConstants.CLAIM_ROLE, String.class));
    }

    public boolean isAccessToken(String token) {
        return JwtConstants.ACCESS_TOKEN.equals(extractTokenType(token));
    }

    public boolean isRefreshToken(String token) {
        return JwtConstants.REFRESH_TOKEN.equals(extractTokenType(token));
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    private String buildToken(User user, long expirationMs, String tokenType) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getEmail())
                .claim(JwtConstants.CLAIM_USER_ID, user.getId().toString())
                .claim(JwtConstants.CLAIM_ROLE, user.getRole().name())
                .claim(JwtConstants.CLAIM_TOKEN_TYPE, tokenType)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(signingKey)
                .compact();
    }

    private String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get(JwtConstants.CLAIM_TOKEN_TYPE, String.class));
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
