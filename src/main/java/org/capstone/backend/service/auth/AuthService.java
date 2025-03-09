package org.capstone.backend.service.auth;

import org.capstone.backend.entity.Account;
import org.springframework.security.oauth2.core.user.OAuth2User;

public interface AuthService {
    String login(String loginIdentifier, String rawPassword);

    Account register(String username, String email, String rawPassword);

    String loginWithOAuth2(OAuth2User oAuth2User);

    void sendOtpToVerifyAccount(String email) throws Exception;

    boolean verifyAccount(String email, String otp);

    void sendOtpForPasswordReset(String email) throws Exception;

    boolean resetPassword(String email, String otp, String newPassword);
}