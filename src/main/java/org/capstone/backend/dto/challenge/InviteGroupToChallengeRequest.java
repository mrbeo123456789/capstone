package org.capstone.backend.dto.challenge;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class InviteGroupToChallengeRequest {
    @NotNull(message = "Challenge ID cannot be null")
    private Long challengeId;

    @NotNull(message = "Group IDs cannot be null")
    private List<Long> groupIds;
}
