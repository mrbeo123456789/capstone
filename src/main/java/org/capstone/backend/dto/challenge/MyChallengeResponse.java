package org.capstone.backend.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.capstone.backend.utils.enums.ChallengeRole;
import org.capstone.backend.utils.enums.ChallengeStatus;
@Data
@AllArgsConstructor
public class MyChallengeResponse {
    private Long id;
    private String name;
    private String picture;
    private ChallengeStatus status; // Trạng thái thử thách
    private ChallengeRole role; // Vai trò của user trong thử thách
}
