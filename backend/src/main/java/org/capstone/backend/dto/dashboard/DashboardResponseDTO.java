package org.capstone.backend.dto.dashboard;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class DashboardResponseDTO {
    private Long totalMembers;
    private Double memberGrowthRate;
    private Long activeChallenges;
    private Double challengeGrowthRate;
    private Long pendingReports;
    private Map<String, Long> challengeStatusCounts;
}