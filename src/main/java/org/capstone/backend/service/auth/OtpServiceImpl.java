package org.capstone.backend.service.auth;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.entity.OtpCode;
import org.capstone.backend.repository.OtpCodeRepository;
import org.capstone.backend.utils.sendmail.FixedGmailService;
import org.capstone.backend.utils.exception.BadRequestException;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final OtpCodeRepository otpCodeRepository;
    private final FixedGmailService emailService;

    @Override
    public void generateAndSendOtp(String email) {
        // Tạo OTP gồm 6 chữ số
        String otp = generateOtp();
        String hashedOtp = BCrypt.hashpw(otp, BCrypt.gensalt());

        // Lưu mã OTP đã được hash vào cơ sở dữ liệu kèm thời gian hết hạn
        OtpCode otpCode = new OtpCode();
        otpCode.setEmail(email);
        otpCode.setOtpHash(hashedOtp);
        otpCode.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otpCodeRepository.save(otpCode);

        // Gửi OTP qua email. Nếu có lỗi trong emailService.sendEmail, exception sẽ được đẩy xuống GlobalExceptionHandler.
        emailService.sendEmail(email, "Mã OTP", "Mã OTP của bạn: " + otp);
    }

    @Override
    public boolean verifyOtp(String email, String otp) {
        Optional<OtpCode> otpCodeOpt = otpCodeRepository.findTopByEmailOrderByExpiresAtDesc(email);

        if (otpCodeOpt.isEmpty()) {
            throw new BadRequestException("Không tìm thấy mã OTP cho email này.");
        }

        OtpCode otpCode = otpCodeOpt.get();

        if (otpCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã OTP đã hết hạn.");
        }

        if (!BCrypt.checkpw(otp, otpCode.getOtpHash())) {
            throw new BadRequestException("Mã OTP không chính xác.");
        }

        otpCode.setUsed(true);
        otpCodeRepository.save(otpCode);
        return true;
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(1_000_000)); // OTP 6 chữ số
    }
}
