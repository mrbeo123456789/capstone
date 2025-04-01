package org.capstone.backend.dto.dashboard;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GrowthDataDTO {
    private List<String> dates;
    private List<Integer> newMembers;
    private List<Integer> newChallenges;
}