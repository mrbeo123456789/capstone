package org.capstone.backend.service;


import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.Member;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.utils.JwtUtil;
import org.capstone.backend.utils.enums.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MemberRepository memberRepository;

    @Autowired
    public AuthService(AccountRepository accountRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       MemberRepository memberRepository) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.memberRepository = memberRepository;
    }

    public String login(String username, String rawPassword) {
        Optional<Account> accountOpt = accountRepository.findByUsername(username);
        if (accountOpt.isPresent()) {
            Account account = accountOpt.get();
            if (passwordEncoder.matches(rawPassword, account.getPassword())) {
                return jwtUtil.generateToken(account.getUsername(), account.getRole().toString());
            }
        }
        throw new RuntimeException("Invalid credentials");
    }

    public Account register(String username, String email, String rawPassword) {
        // Check if username exists
        Optional<Account> accountByUsername = accountRepository.findByUsername(username);
        if (accountByUsername.isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        // Check if email exists
        Optional<Account> accountByEmail = accountRepository.findByEmail(email);
        if (accountByEmail.isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Account account = new Account();
        account.setUsername(username);
        account.setEmail(email);
        // Encode the raw password
        account.setPassword(passwordEncoder.encode(rawPassword));
        // Set role as MEMBER (using enum Role)
        account.setRole(Role.MEMBER);
        // Optionally, set createdAt and createdBy fields if needed
         account.setCreatedAt(LocalDateTime.now());
        // account.setCreatedBy(username);

        return accountRepository.save(account);
    }
    // Xác thực bằng OAuth2 (Google)
    public String loginWithOAuth2(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        Optional<Account> accountOpt = accountRepository.findByEmail(email);

        Account account;
        if (accountOpt.isPresent()) {
            account = accountOpt.get();
        } else {
            // Nếu user chưa có trong database, tạo mới
            account = new Account();
            account.setUsername(email.split("@")[0]);
            account.setEmail(email);
            account.setUsername(oAuth2User.getAttribute("name"));
            account.setRole(Role.MEMBER);
            accountRepository.save(account);
        }

        return jwtUtil.generateToken(account.getUsername(), account.getRole().toString());
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
