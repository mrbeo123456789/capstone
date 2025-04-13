package org.capstone.backend.controller.admin;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.RequiredArgsConstructor;
import org.capstone.backend.config.RefreshTokenUpdater;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/mail")
@RequiredArgsConstructor
public class ChangeMailController {

    private final Dotenv dotenv = Dotenv.load();
    private final RefreshTokenUpdater refreshTokenUpdater; // Inject

    /**
     * API 1: Generate Google Authorization Link
     */
    @GetMapping("/generate-auth-link")
    public ResponseEntity<String> generateAuthLink() {
        String clientId = dotenv.get("GOOGLE_CLIENT_ID");
        String redirectUri = dotenv.get("GOOGLE_REDIRECT_URI_FOR_SYSTEM_MAIL");
        String scope = "https://www.googleapis.com/auth/gmail.send";

        String authUrl = "https://accounts.google.com/o/oauth2/auth"
                + "?client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&response_type=code"
                + "&scope=" + scope
                + "&access_type=offline"
                + "&prompt=consent";

        return ResponseEntity.ok(authUrl);
    }

    /**
     * API 2: Exchange Authorization Code for Refresh Token
     */
    @PostMapping("/exchange-token")
    public ResponseEntity<String> exchangeToken(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");

        try {
            String clientId = dotenv.get("GOOGLE_CLIENT_ID");
            String clientSecret = dotenv.get("GOOGLE_CLIENT_SECRET");
            String redirectUri = dotenv.get("GOOGLE_REDIRECT_URI_FOR_SYSTEM_MAIL");

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/token"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(
                            "code=" + code +
                                    "&client_id=" + clientId +
                                    "&client_secret=" + clientSecret +
                                    "&redirect_uri=" + redirectUri +
                                    "&grant_type=authorization_code"
                    ))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> json = mapper.readValue(response.body(), new TypeReference<>() {});

            String refreshToken = (String) json.get("refresh_token");

            if (refreshToken == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Không lấy được refresh_token! Có thể thiếu quyền hoặc thiếu access_type=offline.");
            }

            refreshTokenUpdater.updateAndReloadGoogleRefreshToken(refreshToken); // 🚀 Ghi file + reload environment

            return ResponseEntity.ok("Refresh token mới đã lưu và reload thành công!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi: " + e.getMessage());
        }
    }
}
