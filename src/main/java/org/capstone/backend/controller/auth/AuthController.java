package org.capstone.backend.controller.auth;


import jakarta.validation.Valid;
import org.capstone.backend.dto.auth.LoginRequest;
import org.capstone.backend.dto.auth.LoginResponse;
import org.capstone.backend.dto.auth.RegisterRequest;
import org.capstone.backend.entity.Account;
import org.capstone.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {

            String token = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
            return ResponseEntity.ok(new LoginResponse(token));
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Username or password is not correct");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            System.out.println("Received Register Request: " + registerRequest); // Debug dữ liệu nhận
            Account newAccount = authService.register(
                    registerRequest.getUsername(),
                    registerRequest.getEmail(),
                    registerRequest.getPassword()
            );


            Map<String, String> response = new HashMap<>();
            response.put("message", "Registration successful for user: " + newAccount.getUsername());

            return ResponseEntity.ok(response); // Returns JSON format
        } catch (RuntimeException ex) {
            System.out.println("Registration error: " + ex.getMessage());


            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", ex.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }


}
