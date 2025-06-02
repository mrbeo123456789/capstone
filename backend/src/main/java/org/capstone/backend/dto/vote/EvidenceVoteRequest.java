package org.capstone.backend.dto.vote;

import lombok.Data;

@Data
public class EvidenceVoteRequest {
    private Integer score; // 1–5
    private String comment; // optional
}
