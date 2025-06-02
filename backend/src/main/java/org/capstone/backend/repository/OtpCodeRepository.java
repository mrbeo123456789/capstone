package org.capstone.backend.repository;

import org.capstone.backend.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findTopByEmailOrderByExpiresAtDesc(String email);
}
