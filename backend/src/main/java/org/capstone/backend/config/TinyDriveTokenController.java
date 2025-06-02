package org.capstone.backend.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.capstone.backend.entity.Account;
import org.capstone.backend.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/tinymce")
public class TinyDriveTokenController {

    private final PrivateKey privateKey;
    private final AccountRepository accountRepository;

    public TinyDriveTokenController(
            AccountRepository accountRepository,
            @Value("classpath:private.pem") Resource pemResource
    ) throws Exception {
        this.accountRepository = accountRepository;

        String pemContent;
        try (InputStream is = pemResource.getInputStream()) {
            pemContent = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }

        this.privateKey = parsePrivateKey(pemContent);
    }

    private PrivateKey parsePrivateKey(String pem) throws Exception {
        String base64Key = pem
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");

        byte[] keyBytes = Base64.getDecoder().decode(base64Key);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
        return KeyFactory.getInstance("RSA").generatePrivate(keySpec);
    }

    @GetMapping("/token")
    public ResponseEntity<Map<String, String>> getToken() {
        Instant now = Instant.now();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        String username = auth.getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        String email = account.getEmail();

        String jwt = Jwts.builder()
                .setSubject(email)
                .claim("name", username)
                .claim("permissions", new String[]{"file:read", "file:write"})
                .claim("https://claims.tiny.cloud/drive/root", "/" + email)
                .setAudience("tinydrive")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(7200)))
                .signWith(SignatureAlgorithm.RS256, privateKey)
                .compact();

        return ResponseEntity.ok(Map.of("token", jwt));
    }
}
