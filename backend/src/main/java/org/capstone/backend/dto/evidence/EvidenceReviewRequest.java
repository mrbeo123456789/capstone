package org.capstone.backend.dto.evidence;

import lombok.Data;

@Data
public class EvidenceReviewRequest {
    private Long evidenceId;
    private Boolean isApproved;
    private String feedback;
}
