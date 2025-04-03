package org.capstone.backend.entity;

import jakarta.persistence.*;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "challenge_star_rating",
       uniqueConstraints = @UniqueConstraint(columnNames = {"challenge_id", "member_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeStarRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "challenge_id", nullable = false)
    private Long challengeId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "total_star", nullable = false)
    private Integer totalStar;

    @Column(name = "total_rating_count", nullable = false)
    private Integer totalRatingCount;

    @Column(name = "average_star", nullable = false)
    private Double averageStar;

    @Column(name = "given_rating_count", nullable = false)
    private Integer givenRatingCount;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
