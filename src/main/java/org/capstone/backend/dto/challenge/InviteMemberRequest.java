package org.capstone.backend.dto.challenge;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InviteMemberRequest {
    @NotNull(message = "Challenge ID cannot be null")
    private Long challengeId;

    @NotNull(message = "Member ID cannot be null")
    private Long memberId;

}
