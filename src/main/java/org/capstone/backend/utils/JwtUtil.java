package org.capstone.backend.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;
import java.util.Date;
import java.util.Map;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

@Component
public class JwtUtil {

    private final String jwtSecret = "mySecretKeymySecretKeymySecretKeymySecret"; // at least 32 characters
    private final long jwtExpirationMs = 86400000; // 24 hours

    /**
     * Generates a JWT token containing the username and role as claims.
     *
     * @param username the user's username.
     * @param role the user's role (e.g., "ADMIN" or "MEMBER").
     * @return the generated JWT token.
     */
    public String generateToken(String username, String role) {
        SecretKey key = new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), SignatureAlgorithm.HS256.getJcaName());
        return Jwts.builder()
                .setSubject(username)
                .addClaims(Map.of("role", role))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(SignatureAlgorithm.HS256, key)
                .compact();
    }
}
