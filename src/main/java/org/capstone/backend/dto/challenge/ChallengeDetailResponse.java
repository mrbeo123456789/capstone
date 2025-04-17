package org.capstone.backend.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.capstone.backend.utils.enums.ChallengeStatus;
import org.capstone.backend.utils.enums.ParticipationType;
import org.capstone.backend.utils.enums.VerificationType;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChallengeDetailResponse {
    private Long id;
    private String name;
    private String description;
    private String summary;
    private LocalDate startDate;
    private LocalDate endDate;
    private String picture;
    private String challengeType;
    private ChallengeStatus challengeStatus;// Thời gian của thử thách, tính theo số ngày
    private boolean joined;
    private long participantCount;
    private long duration;
    private VerificationType verificationType;    // Cập nhật kiểu enum
    private ParticipationType participationType;   // Cập nhật kiểu enum
}
