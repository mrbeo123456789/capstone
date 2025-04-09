package org.capstone.backend.dto.rank;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GlobalMemberRankingResponse {
    private Long memberId;
    private String fullName;
    private Long totalStars;
    private String avatar; // 👈 thêm field avt
}
