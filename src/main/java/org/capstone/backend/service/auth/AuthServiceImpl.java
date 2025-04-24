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
                new ResourceNotFoundException("ACCOUNT_NOT_FOUND")); // Mã lỗi

        if (account.getStatus() == AccountStatus.INACTIVE) {
                throw new ForbiddenException("ACCOUNT_NOT_VERIFIED");
        }

        if (account.getStatus() == AccountStatus.BANNED) {
            throw new ForbiddenException("ACCOUNT_BANNED");
        }

        if (!passwordEncoder.matches(rawPassword, account.getPassword())) {
            throw new UnauthorizedException("INVALID_PASSWORD");
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
    public void sendOtpToVerifyAccount(String loginIdentifier) {
        // Kiểm tra xem email có tồn tại trong hệ thống không
        Optional<Account> account = accountRepository.findByEmail(loginIdentifier);

        if (account.isEmpty()) {
            account = accountRepository.findByUsername(loginIdentifier);
        }

        if (account.isEmpty()) {
            throw new ResourceNotFoundException("ACCOUNT_NOT_FOUND");
        }

        otpService.generateAndSendOtp(account.get().getEmail());
    }
    @Override
    public boolean verifyAccount(String loginIdentifier, String otp) {
        // Tìm theo email trước, không có thì thử username
        Optional<Account> accountOpt = accountRepository.findByEmail(loginIdentifier);
        if (accountOpt.isEmpty()) {
            accountOpt = accountRepository.findByUsername(loginIdentifier);
        }

        Account account = accountOpt.orElseThrow(() ->
                new ResourceNotFoundException("ACCOUNT_NOT_FOUND")
        );

        // Xác thực OTP bằng email thật của tài khoản
        if (!otpService.verifyOtp(account.getEmail(), otp)) {
            throw new BadRequestException("OTP_INVALID_OR_EXPIRED");
        }

        // Cập nhật trạng thái
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
            member.setFullName(account.getUsername());
            member.setCreatedAt(LocalDateTime.now());
            memberRepository.save(member);
        }
    }
}
