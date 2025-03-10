package org.capstone.backend.service.auth;

import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.Member;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.utils.enums.AccountStatus;
import org.capstone.backend.utils.enums.Role;
import org.capstone.backend.utils.jwt.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final MemberRepository memberRepository;
    @Autowired
    public AuthServiceImpl(AccountRepository accountRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, OtpService otpService, MemberRepository memberRepository) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.otpService = otpService;
        this.memberRepository = memberRepository;
    }

    @Override
    public String login(String loginIdentifier, String rawPassword) {
        Optional<Account> accountOpt;

        if (loginIdentifier.contains("@")) {
            accountOpt = accountRepository.findByEmail(loginIdentifier);
        } else {
            accountOpt = accountRepository.findByUsername(loginIdentifier);
        }

        if (accountOpt.isEmpty()) {
            throw new RuntimeException("Tài khoản không tồn tại!");
        }

        Account account = accountOpt.get();

        // 🔴 Kiểm tra trạng thái tài khoản trước khi đăng nhập
        if (account.getStatus() == AccountStatus.INACTIVE) {
            throw new RuntimeException("Tài khoản chưa được xác minh! Vui lòng kiểm tra email.");
        }
        if (account.getStatus() == AccountStatus.BANNED) {
            throw new RuntimeException("Tài khoản đã bị khóa!");
        }

        if (!passwordEncoder.matches(rawPassword, account.getPassword())) {
            throw new RuntimeException("Sai mật khẩu!");
        }

        return jwtUtil.generateToken(account.getUsername(), account.getRole().toString());
    }

    @Override
    public Account register(String username, String email, String rawPassword) {
        if (accountRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Tên người dùng đã tồn tại!");
        }

        if (accountRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        Account account = new Account();
        account.setUsername(username);
        account.setEmail(email);
        account.setPassword(passwordEncoder.encode(rawPassword));
        account.setRole(Role.MEMBER);
        account.setStatus(AccountStatus.INACTIVE); // 🔴 Khi đăng ký, tài khoản ở trạng thái "INACTIVE"
        account.setCreatedAt(LocalDateTime.now());

        return accountRepository.save(account);
    }

    @Override
    public String loginWithOAuth2(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        Optional<Account> accountOpt = accountRepository.findByEmail(email);

        Account account;
        if (accountOpt.isPresent()) {
            account = accountOpt.get();
        } else {
            account = new Account();
            account.setUsername(email.split("@")[0]);
            account.setEmail(email);
            account.setUsername(oAuth2User.getAttribute("name"));
            account.setRole(Role.MEMBER);
            account.setStatus(AccountStatus.ACTIVE); // 🔵 OAuth2 tài khoản sẽ ACTIVE ngay
            accountRepository.save(account);
        }

        return jwtUtil.generateToken(account.getUsername(), account.getRole().toString());
    }

    // 🟢 Gửi OTP để xác minh tài khoản
    @Override
    public void sendOtpToVerifyAccount(String email) throws Exception {
        otpService.generateAndSendOtp(email);
    }

    // 🟢 Xác minh OTP để kích hoạt tài khoản
    @Override
    public boolean verifyAccount(String email, String otp) {
        if (!otpService.verifyOtp(email, otp)) {
            return false;
        }

        Optional<Account> accountOpt = accountRepository.findByEmail(email);
        if (accountOpt.isEmpty()) {
            return false;
        }

        Account account = accountOpt.get();
        account.setStatus(AccountStatus.ACTIVE); // 🔵 Đổi trạng thái thành ACTIVE sau khi xác minh
        accountRepository.save(account);

        return true;
    }

    // 🟢 Gửi OTP quên mật khẩu
    @Override
    public void sendOtpForPasswordReset(String email) throws Exception {
        otpService.generateAndSendOtp(email);
    }

    // 🟢 Xác minh OTP và đặt lại mật khẩu mới
    @Override
    public boolean resetPassword(String email, String newPassword) {
        Optional<Account> accountOpt = accountRepository.findByEmail(email);
        if (accountOpt.isEmpty()) {
            return false;
        }

        Account account = accountOpt.get();
        account.setPassword(passwordEncoder.encode(newPassword));
        accountRepository.save(account);

        return true;
    }
    public Long getMemberIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("User is not authenticated");
        }
        // 🔥 Get username from Authentication
        String username = authentication.getName();  // Usually the `sub` from JWT
        // 🔥 Find the Account using username
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        // 🔥 Find Member using Account (not Account ID)
        Member member = memberRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        return member.getId();
    }
}
