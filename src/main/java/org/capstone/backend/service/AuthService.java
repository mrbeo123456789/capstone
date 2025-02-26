package org.capstone.backend.service;


import org.capstone.backend.entity.Account;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.utils.JwtUtil;
import org.capstone.backend.utils.enums.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthService(AccountRepository accountRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
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
        // account.setCreatedAt(LocalDateTime.now());
        // account.setCreatedBy(username);

        return accountRepository.save(account);
    }
}
