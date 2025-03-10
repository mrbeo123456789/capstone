    package org.capstone.backend.controller.auth;


    import jakarta.validation.Valid;
    import org.capstone.backend.dto.auth.LoginRequest;
    import org.capstone.backend.dto.auth.LoginResponse;
    import org.capstone.backend.dto.auth.RegisterRequest;
    import org.capstone.backend.entity.Account;
    import org.capstone.backend.service.auth.AuthService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
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
            } catch (RuntimeException e) {
                String errorMessage = e.getMessage();
                System.out.println("Login error: " + errorMessage);

                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", errorMessage);

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
        }

        @PostMapping("/register")
        public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
            try {
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
        @PostMapping("/verify-account")
        public ResponseEntity<String> sendOtpToVerifyAccount(@RequestParam String email) throws Exception {
            authService.sendOtpToVerifyAccount(email);
            return ResponseEntity.ok("OTP đã được gửi đến email.");
        }

        @PostMapping("/confirm-verification")
        public ResponseEntity<String> verifyAccount(@RequestBody Map<String, String> request) {
            String email = request.get("email");
            String otp = request.get("otp");
            if (!authService.verifyAccount(email, otp)) {
                return ResponseEntity.badRequest().body("OTP không hợp lệ hoặc đã hết hạn!");
            }
            return ResponseEntity.ok("OTP correct");
        }

        @PostMapping("/forgot-password")
        public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) throws Exception {
            String email = request.get("email");
            authService.sendOtpForPasswordReset(email);
            return ResponseEntity.ok("OTP đã được gửi đến email.");
        }

        @PostMapping("/reset-password")
        public ResponseEntity<String> resetPassword(@RequestBody String email,
                                                    @RequestBody String newPassword) {
            if (!authService.resetPassword(email, newPassword)) {
                return ResponseEntity.badRequest().body("Change failed");
            }
            return ResponseEntity.ok("Mật khẩu đã được cập nhật thành công!");
        }

    }
