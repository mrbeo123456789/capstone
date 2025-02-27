package org.capstone.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.capstone.backend.service.AuthService;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final ObjectMapper objectMapper;

    public OAuth2SuccessHandler(AuthService authService, ObjectMapper objectMapper) {
        this.authService = authService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Gọi service để tạo JWT Token
        String token = authService.loginWithOAuth2(oAuth2User);

        // Trả về JSON thay vì redirect
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, String> tokenResponse = new HashMap<>();
        tokenResponse.put("token", token);

        response.getWriter().write(objectMapper.writeValueAsString(tokenResponse));
    }
}
