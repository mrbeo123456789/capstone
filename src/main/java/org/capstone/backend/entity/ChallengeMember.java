package org.capstone.backend.entity;

import lombok.*;
import jakarta.persistence.*;
import org.capstone.backend.utils.enums.ChallengeMemberStatus;
import org.capstone.backend.utils.enums.ChallengeRole;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "challenge_member")
public class ChallengeMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "challenge_member_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;

    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "join_by")
    private Long joinBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ChallengeMemberStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private ChallengeRole role;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    @Column(name = "group_id")
    private Long groupId; // nullable: null nếu tham gia cá nhân

    // ----- Thêm trường tham gia thử thách -----
    @Column(name = "is_participate", nullable = false)
    private Boolean isParticipate;

    // ------------------------------------------

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        // Thiết lập mặc định isParticipate theo role
        initializeParticipationFlag();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        // Đảm bảo logic cho isParticipate
        initializeParticipationFlag();
    }

    /**
     * Nếu role là MEMBER hoặc CO_HOST, isParticipate luôn là true.
     * Nếu role là HOST, isParticipate giữ nguyên giá trị đã đặt (true hoặc false).
     */
    private void initializeParticipationFlag() {
        if (role == ChallengeRole.MEMBER || role == ChallengeRole.CO_HOST) {
            this.isParticipate = true;
        } else if (role == ChallengeRole.HOST && this.isParticipate == null) {
            // Mặc định HOST chưa tham gia
            this.isParticipate = false;
        }
    }
}
