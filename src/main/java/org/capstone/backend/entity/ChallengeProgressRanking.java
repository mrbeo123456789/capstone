package org.capstone.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "challenge_progress_ranking",
       uniqueConstraints = @UniqueConstraint(columnNames = {"challenge_id", "member_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeProgressRanking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "challenge_id", nullable = false)
    private Long challengeId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

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
