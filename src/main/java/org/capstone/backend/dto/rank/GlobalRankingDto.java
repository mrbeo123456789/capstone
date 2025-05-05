package org.capstone.backend.dto.rank;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GlobalRankingDto {
    private Long memberId;
    private String fullName;
    private Long totalStars;
}
