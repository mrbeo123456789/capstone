package org.capstone.backend.dto.challenge;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InviteGroupToChallengeRequest {
    @NotNull(message = "Challenge ID cannot be null")
    private Long challengeId;

    @NotNull(message = "Group ID cannot be null")
    private Long groupId;
}
