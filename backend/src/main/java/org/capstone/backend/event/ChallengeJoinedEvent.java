package org.capstone.backend.event;

import lombok.AllArgsConstructor;
import lombok.Getter;


public record ChallengeJoinedEvent(Long memberId, Long challengeId) {
}
