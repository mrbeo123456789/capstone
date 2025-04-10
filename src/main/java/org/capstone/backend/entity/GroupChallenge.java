package org.capstone.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.capstone.backend.utils.enums.GroupChallengeStatus;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

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
    private GroupChallengeStatus status;

    // Automatically sets the createdAt field to the time of creation.
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Automatically updates the updatedAt field when the entity is updated.
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Biến boolean để xác định thử thách đã hoàn thành (success) hay thất bại (failure)
    @Column(name = "is_success", nullable = false)
    private boolean isSuccess;
}
