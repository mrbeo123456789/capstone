package org.capstone.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.capstone.backend.service.auth.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final ObjectMapper objectMapper;
    private final String redirectBaseUrl;

    public OAuth2SuccessHandler(
            AuthService authService,
            ObjectMapper objectMapper,
            @Value("${google.frontend-redirect-uri}")
            String redirectBaseUrl
    ) {
        this.authService = authService;
        this.objectMapper = objectMapper;
        this.redirectBaseUrl = redirectBaseUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

            System.out.println("✅ OAuth2User: " + oAuth2User.getAttributes());

            String token = authService.loginWithOAuth2(oAuth2User);

            System.out.println("✅ Token: " + token);
            System.out.println("✅ Redirecting to: " + redirectBaseUrl);

            String redirectUrl = UriComponentsBuilder.fromUriString(redirectBaseUrl)
                    .queryParam("token", token)
                    .build().toUriString();

            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            System.out.println("❌ OAuth2 SuccessHandler Error:");
            response.sendRedirect("/login?error=true");
        }
    }

}
