package org.capstone.backend.dto.rank;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeStarRatingResponse {
    private Long memberId;
    private String memberName;
    private String avatar; // 👈 Thêm dòng này
    private Double averageStar;
}
