package org.capstone.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.capstone.backend.utils.enums.GroupChallengeStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_challenge")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_challenge_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Groups group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;

    @Column(name = "join_date", nullable = false)
    private LocalDateTime joinDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private GroupChallengeStatus status; // Enum: ONGOING, COMPLETED, CANCELLED

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
