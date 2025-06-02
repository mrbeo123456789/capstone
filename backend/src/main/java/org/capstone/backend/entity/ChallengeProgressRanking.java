package org.capstone.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.capstone.backend.utils.key.ChallengeProgressRankingId;

import java.time.LocalDateTime;

@Entity
@Table(name = "challenge_progress_ranking")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeProgressRanking {

    @EmbeddedId
    private ChallengeProgressRankingId id;

    @Column(name = "completed_days")
    private Integer completedDays;

    @Column(name = "vote_given_count")
    private Integer voteGivenCount;

    @Column(name = "approved_evidence_count")
    private Integer approvedEvidenceCount;

    @Column(name = "score")
    private Integer score;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
