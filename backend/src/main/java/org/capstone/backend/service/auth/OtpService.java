package org.capstone.backend.service.auth;

public interface OtpService {
    void generateAndSendOtp(String email);
    boolean verifyOtp(String email, String otp);
}
