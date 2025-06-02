package org.capstone.backend.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChallengeStatisticDTO {
    private Long challengeId;
    private String challengeName;

    private Integer totalParticipants;
    private Long totalGroups;

    private Integer totalEvidenceSubmitted;
    private Integer approvedEvidence;
    private Integer pendingEvidence;
    private Integer rejectedEvidence;

    private Double participationRate;
    private Double completionRate;

//    private Integer totalVotes;
//    private Double averageRating;
//    private Integer totalRatings;

    private LocalDate today;
    private Integer evidenceSubmittedToday;
    private Integer pendingReviewToday;
}
