package org.capstone.backend.dto.evidence;

import lombok.Data;

@Data
public class EvidenceSubmissionRequest {
    private Long challengeId;
    private String evidenceUrl;
}