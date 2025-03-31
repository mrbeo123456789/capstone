package org.capstone.backend.dto.vote;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EvidenceVoteResponse {
    private Long evidenceId;
    private String evidenceUrl;
}
