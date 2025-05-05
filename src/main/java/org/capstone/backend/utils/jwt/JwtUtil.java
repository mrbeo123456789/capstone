package org.capstone.backend.utils.jwt;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.interfaces.RSAPrivateCrtKey;
import java.security.interfaces.RSAPublicKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.RSAPublicKeySpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
@Data
public class JwtUtil {

    @Value("${jwt.private-key-path:}")
    private String pemPathFromProperties;

    private RSAKey rsaKey;
    private JwtEncoder jwtEncoder;
    private JwtDecoder jwtDecoder;

    @PostConstruct
    public void init() throws Exception {
        this.rsaKey = loadRsaKeyFromPrivatePem();
        this.jwtEncoder = initJwtEncoder();
        this.jwtDecoder = initJwtDecoder();
    }

    private RSAKey loadRsaKeyFromPrivatePem() throws Exception {
        InputStream inputStream;

        if (pemPathFromProperties != null && !pemPathFromProperties.isBlank()) {
            System.out.println("🔐 Loading RSA key from property path: " + pemPathFromProperties);
            inputStream = new FileInputStream(pemPathFromProperties);
        } else {
            System.out.println("🔐 Loading RSA key from classpath: private.pem");
            inputStream = getClass().getClassLoader().getResourceAsStream("private.pem");
            if (inputStream == null) {
                throw new IllegalStateException("❌ private.pem not found in classpath and no jwt.private-key-path provided.");
            }
        }

        String privateKeyPem = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8)
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");

        byte[] keyBytes = Base64.getDecoder().decode(privateKeyPem);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PrivateKey privateKey = keyFactory.generatePrivate(keySpec);

        var rsaPrivateKey = (RSAPrivateCrtKey) privateKey;

        RSAPublicKeySpec publicKeySpec = new RSAPublicKeySpec(
                rsaPrivateKey.getModulus(),
                rsaPrivateKey.getPublicExponent()
        );
        RSAPublicKey publicKey = (RSAPublicKey) keyFactory.generatePublic(publicKeySpec);

        return new RSAKey.Builder(publicKey)
                .privateKey((RSAPrivateKey) privateKey)
                .build();
    }

    private JwtEncoder initJwtEncoder() {
        JWKSource<SecurityContext> jwkSource = new ImmutableJWKSet<>(new com.nimbusds.jose.jwk.JWKSet(rsaKey));
        return new NimbusJwtEncoder(jwkSource);
    }

    private JwtDecoder initJwtDecoder() throws JOSEException {
        return NimbusJwtDecoder.withPublicKey(rsaKey.toRSAPublicKey()).build();
    }

    public String generateToken(String username, String role) {
        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("capstone-project")
                .issuedAt(now)
                .expiresAt(now.plus(10, ChronoUnit.HOURS))
                .subject(username)
                .claim("roles", role)
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
}
