package org.capstone.backend.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.capstone.backend.utils.enums.ChallengeRole;
import org.capstone.backend.utils.enums.ChallengeStatus;
import org.capstone.backend.utils.enums.ParticipationType;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class MyChallengeBaseResponse {
    private Long id;
    private String name;
    private String picture;
    private ChallengeStatus status;
    private ChallengeRole role;
    private LocalDate startDate;
    private LocalDate endDate;
    private ParticipationType participationType;
}
