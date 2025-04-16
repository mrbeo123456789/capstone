package org.capstone.backend.controller.auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.auth.LoginRequest;
import org.capstone.backend.dto.auth.LoginResponse;
import org.capstone.backend.dto.auth.RegisterRequest;
import org.capstone.backend.entity.Account;
import org.capstone.backend.service.auth.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest loginRequest) {
        String token = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
        return ResponseEntity.ok(new LoginResponse(token));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody @Valid RegisterRequest registerRequest) {
        Account newAccount = authService.register(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                registerRequest.getPassword()
        );
        return ResponseEntity.ok(Map.of("message", "Registration successful for user: " + newAccount.getUsername()));
    }

    @PostMapping("/verify-account")
    public ResponseEntity<Map<String, String>> sendOtpToVerifyAccount(@RequestParam String email) {
        authService.sendOtpToVerifyAccount(email);
        return ResponseEntity.ok(Map.of("message", "OTP đã được gửi đến email."));
    }

    @PostMapping("/confirm-verification")
    public ResponseEntity<Map<String, String>> verifyAccount(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (!authService.verifyAccount(email, otp)) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP không hợp lệ hoặc đã hết hạn!"));
        }
        return ResponseEntity.ok(Map.of("message", "OTP correct"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        authService.sendOtpForPasswordReset(email);
        return ResponseEntity.ok(Map.of("message", "OTP đã được gửi đến email."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        if (!authService.resetPassword(email, newPassword)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Change failed"));
        }
        return ResponseEntity.ok(Map.of("message", "Mật khẩu đã được cập nhật thành công!"));
    }
}
