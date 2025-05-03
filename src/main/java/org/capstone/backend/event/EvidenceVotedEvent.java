package org.capstone.backend.event;

import lombok.Getter;



public record EvidenceVotedEvent(Long reviewerId, Long evidenceId) {
}
