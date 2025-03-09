package org.capstone.backend.service.auth;


import org.capstone.backend.entity.OtpCode;
import org.capstone.backend.repository.OtpCodeRepository;
import org.capstone.backend.utils.sendmail.FixedGmailService;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpServiceImpl implements OtpService {

    private final OtpCodeRepository otpCodeRepository;
    private final FixedGmailService emailService;

    public OtpServiceImpl(OtpCodeRepository otpCodeRepository, FixedGmailService emailService) {
        this.otpCodeRepository = otpCodeRepository;
     this.emailService = emailService;
    }

    @Override
    public void generateAndSendOtp(String email) throws Exception {
        String otp = generateOtp();
        String hashedOtp = BCrypt.hashpw(otp, BCrypt.gensalt());

        OtpCode otpCode = new OtpCode();
        otpCode.setEmail(email);
        otpCode.setOtpHash(hashedOtp);
        otpCode.setExpiresAt(LocalDateTime.now().plusMinutes(5)); 
        otpCodeRepository.save(otpCode);

        emailService.sendEmail(email, "Mã OTP", "Mã OTP của bạn: " + otp);
    }

    @Override
    public boolean verifyOtp(String email, String otp) {
        Optional<OtpCode> otpCodeOpt = otpCodeRepository.findTopByEmailOrderByExpiresAtDesc(email);
        if (otpCodeOpt.isEmpty() || otpCodeOpt.get().getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }

        OtpCode otpCode = otpCodeOpt.get();
        if (!BCrypt.checkpw(otp, otpCode.getOtpHash())) {
            return false;
        }

        otpCode.setUsed(true);
        otpCodeRepository.save(otpCode);
        return true;
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }
}
