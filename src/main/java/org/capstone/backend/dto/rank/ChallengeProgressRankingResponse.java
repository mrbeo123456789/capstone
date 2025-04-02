package org.capstone.backend.dto.rank;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChallengeProgressRankingResponse {
    private Long memberId;
    private String memberName;
    private Integer rank;

}
