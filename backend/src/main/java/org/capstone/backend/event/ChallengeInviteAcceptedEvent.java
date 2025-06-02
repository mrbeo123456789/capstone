package org.capstone.backend.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

public record ChallengeInviteAcceptedEvent(Long inviterId, Long inviteeId, Long challengeId) {
}
