package org.capstone.backend.dto.challenge;

import lombok.Data;

@Data
public class ChallengeSearchRequest {
    private Long challengeid;
    private String keyword;
}
