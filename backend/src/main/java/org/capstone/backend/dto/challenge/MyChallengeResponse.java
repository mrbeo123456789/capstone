package org.capstone.backend.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.capstone.backend.utils.enums.ChallengeRole;
import org.capstone.backend.utils.enums.ChallengeStatus;
import org.capstone.backend.utils.enums.ParticipationType;

@Data
@AllArgsConstructor
public class MyChallengeResponse {
    private Long id;
    private String name;
    private String picture;
    private ChallengeStatus status; // Trạng thái thử thách
    private ChallengeRole role;
    private Long remainingDays;         // nếu UPCOMING hoặc ONGOING
    private Double averageVotes;   // Vai trò của user trong thử thách
    private ParticipationType participationType;
}
