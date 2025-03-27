package org.capstone.backend.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.capstone.backend.entity.Account;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.repository.MemberRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Paths;
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

    public TinyDriveTokenController(AccountRepository accountRepository) throws Exception {
        this.accountRepository = accountRepository;
        // Load your private.pem file (must be in PKCS#8 format)
        String privateKeyContent = new String(Files.readAllBytes(Paths.get("src/main/resources/private.pem")))
                .replaceAll("-----BEGIN PRIVATE KEY-----", "")
                .replaceAll("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");

        byte[] keyBytes = Base64.getDecoder().decode(privateKeyContent);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        this.privateKey = keyFactory.generatePrivate(keySpec);
    }

    @GetMapping("/token")
    public ResponseEntity<Map<String, String>> getToken() {
        Instant now = Instant.now();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName(); // or extract from auth.getPrincipal()

        String sub = accountRepository.findByUsername(username)
                .map(Account::getEmail)
                .orElse("guest@example.com"); // fallback email if not found


        String jwt = Jwts.builder()
                .setSubject(sub)
                .claim("name",username)  // 👈 name
                .claim("permissions", new String[]{"file:read", "file:write"})
                .claim("aud", "tinydrive")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(7200)))
                .signWith(SignatureAlgorithm.RS256, privateKey)
                .compact();

        return ResponseEntity.ok(Map.of("token", jwt));
    }
}
