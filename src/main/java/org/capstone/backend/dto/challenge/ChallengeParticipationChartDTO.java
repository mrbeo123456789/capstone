package org.capstone.backend.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChallengeParticipationChartDTO {
    private String challengeName;
    private Long participatedMembers;
}
