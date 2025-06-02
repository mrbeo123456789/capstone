package org.capstone.backend.dto.challenge;

import lombok.Data;
import org.capstone.backend.utils.enums.ChallengeStatus;

@Data
public class ReviewRequest {
    private ChallengeStatus status;
    private String adminNote;  // Trường ghi chú thêm
}
