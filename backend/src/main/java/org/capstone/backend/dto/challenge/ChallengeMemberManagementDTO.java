package org.capstone.backend.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChallengeMemberManagementDTO {
    private Long memberId;
    private String fullName;
    private String email;
    private String avatar;
    private String role;          // 👈 Không phải ChallengeRole enum mà là String
    private Boolean isParticipate;
    private Boolean isCurrentMember; // 👈 Không dùng primitive boolean
}
