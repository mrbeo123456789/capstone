package org.capstone.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "otp_codes")
public class OtpCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String otpHash; // OTP đã mã hóa

    @Column(nullable = false)
    private LocalDateTime expiresAt; // Thời gian hết hạn OTP

    private boolean isUsed = false; // Đánh dấu OTP đã sử dụng chưa


}
