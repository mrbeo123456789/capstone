package org.capstone.backend.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.capstone.backend.entity.Account;
import org.capstone.backend.repository.AccountRepository;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;
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

    public TinyDriveTokenController(AccountRepository accountRepository, Environment env) throws Exception {
        this.accountRepository = accountRepository;

        String privateKeyPem = null;

        // Ưu tiên đọc file nếu có
        Path pemPath = Paths.get("src/main/resources/private.pem");
        if (Files.exists(pemPath)) {
            privateKeyPem = new String(Files.readAllBytes(pemPath))
                    .replaceAll("-----BEGIN PRIVATE KEY-----", "")
                    .replaceAll("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s+", "");
        } else {
            // Nếu không có file thì fallback sang env
            privateKeyPem = System.getenv("TINYDRIVE_PRIVATE_KEY");
            if (privateKeyPem == null || privateKeyPem.isBlank()) {
                privateKeyPem = env.getProperty("tinydrive.private-key");
            }
        }

        if (privateKeyPem == null || privateKeyPem.isBlank()) {
            throw new IllegalStateException("Missing TinyDrive private key (file, env or config)");
        }

        byte[] keyBytes = Base64.getDecoder().decode(privateKeyPem);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        this.privateKey = keyFactory.generatePrivate(keySpec);
    }


    @GetMapping("/token")
    public ResponseEntity<Map<String, String>> getToken() {
        Instant now = Instant.now();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        String username = auth.getName(); // or extract from auth.getPrincipal()

        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        String sub = account.getEmail();

        String jwt = Jwts.builder()
                .setSubject(sub)
                .claim("name",username)  // 👈 name
                .claim("permissions", new String[]{"file:read", "file:write"})
                .claim("https://claims.tiny.cloud/drive/root", "/" + sub) // ✅ Set root folder
                .setAudience("tinydrive") // ✅ Must be 'tinydrive'
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(7200)))
                .signWith(SignatureAlgorithm.RS256, privateKey)
                .compact();

        return ResponseEntity.ok(Map.of("token", jwt));
    }
}
