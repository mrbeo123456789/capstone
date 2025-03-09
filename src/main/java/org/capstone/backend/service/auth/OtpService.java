package org.capstone.backend.service.auth;

public interface OtpService {
    void generateAndSendOtp(String email) throws Exception;
    boolean verifyOtp(String email, String otp);
}
