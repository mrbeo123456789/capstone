package org.capstone.backend.event;

import lombok.Getter;

import java.time.LocalDate;

public record ProofUploadedEvent(Long memberId, Long challengeId, LocalDate proofDate) {
}
