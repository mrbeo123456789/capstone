package org.capstone.backend.service.auth;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.Member;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.utils.enums.AccountStatus;
import org.capstone.backend.utils.enums.Role;
import org.capstone.backend.utils.jwt.JwtUtil;
import org.capstone.backend.utils.exception.BadRequestException;
import org.capstone.backend.utils.exception.ForbiddenException;
import org.capstone.backend.utils.exception.ResourceNotFoundException;
import org.capstone.backend.utils.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final MemberRepository memberRepository;

    @Override
    public String login(String loginIdentifier, String rawPassword) {
        Optional<Account> accountOpt = loginIdentifier.contains("@")
                ? accountRepository.findByEmail(loginIdentifier)
                : accountRepository.findByUsername(loginIdentifier);

        Account account = accountOpt.orElseThrow(() ->
                new ResourceNotFoundException("Tài khoản không tồn tại."));

        if (account.getStatus() == AccountStatus.INACTIVE) {
            throw new ForbiddenException("Tài khoản chưa được xác minh. Vui lòng kiểm tra email.");
        }
        if (account.getStatus() == AccountStatus.BANNED) {
            throw new ForbiddenException("Tài khoản đã bị khóa.");
        }

        if (!passwordEncoder.matches(rawPassword, account.getPassword())) {
            throw new UnauthorizedException("Sai mật khẩu.");
        }

        return jwtUtil.generateToken(account.getUsername(), account.getRole().toString());
    }

    @Override
    public Account register(String username, String email, String rawPassword) {
        // Kiểm tra khoảng trắng trong các trường
        if (username.contains(" ") || email.contains(" ") || rawPassword.contains(" ")) {
            throw new BadRequestException("Không được chứa khoảng trắng trong tên người dùng, email hoặc mật khẩu.");
        }

        if (accountRepository.findByUsername(username).isPresent()) {
            throw new BadRequestException("Tên người dùng đã tồn tại.");
        }
        if (accountRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("Email đã tồn tại.");
        }

        Account account = new Account();
        account.setUsername(username);
        account.setEmail(email);
        account.setPassword(passwordEncoder.encode(rawPassword));
        account.setRole(Role.MEMBER);
        account.setStatus(AccountStatus.INACTIVE);
        account.setCreatedAt(LocalDateTime.now());

        Account savedAccount = accountRepository.save(account);
        createMemberIfNotExists(savedAccount);

        return savedAccount;
    }


    @Override
    public String loginWithOAuth2(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            throw new BadRequestException("Không thể xác định email từ tài khoản OAuth2.");
        }

        Account account = accountRepository.findByEmail(email).orElseGet(() -> {
            Account newAccount = new Account();
            // Sử dụng thông tin "name" từ OAuth2User để làm username
            newAccount.setUsername(oAuth2User.getAttribute("name"));
            newAccount.setEmail(email);
            newAccount.setRole(Role.MEMBER);
            newAccount.setStatus(AccountStatus.ACTIVE);
            newAccount.setCreatedAt(LocalDateTime.now());
            return accountRepository.save(newAccount);
        });

        createMemberIfNotExists(account);

        return jwtUtil.generateToken(account.getUsername(), account.getRole().toString());
    }

    @Override
    public void sendOtpToVerifyAccount(String email) {
        // Kiểm tra xem email có tồn tại trong hệ thống không
        Optional<Account> account = accountRepository.findByEmail(email);
        if (account.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy tài khoản với email: " + email);
        }

        otpService.generateAndSendOtp(email);
    }

    @Override
    public boolean verifyAccount(String email, String otp) {
        if (!otpService.verifyOtp(email, otp)) {
            throw new BadRequestException("OTP không hợp lệ hoặc đã hết hạn.");
        }

        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản tương ứng."));

        account.setStatus(AccountStatus.ACTIVE);
        accountRepository.save(account);

        return true;
    }

    @Override
    public void sendOtpForPasswordReset(String email) {
        // Kiểm tra xem email có tồn tại trong hệ thống không
        Optional<Account> account = accountRepository.findByEmail(email);
        if (account.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy tài khoản  ");
        }

        otpService.generateAndSendOtp(email);
    }

    @Override
    public boolean resetPassword(String email, String newPassword) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản tương ứng."));

        account.setPassword(passwordEncoder.encode(newPassword));
        accountRepository.save(account);

        return true;
    }

    @Override
    public Long getMemberIdFromAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản."));

        return memberRepository.findByAccount(account)
                .map(Member::getId)
                .orElse(null);
    }


    private void createMemberIfNotExists(Account account) {
        if (memberRepository.findByAccount(account).isEmpty()) {
            Member member = new Member();
            member.setAccount(account);
            member.setCreatedAt(LocalDateTime.now());
            memberRepository.save(member);
        }
    }
}
