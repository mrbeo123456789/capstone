package org.capstone.backend.dto.evidence;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.capstone.backend.utils.enums.EvidenceStatus;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidenceVoteHistoryResponse {
    private Long evidenceId;
    private String evidenceUrl;
    private LocalDateTime submittedAt;

    private Long challengeId;
    private String challengeName;

    private Integer score;
    private LocalDateTime votedAt;
}

