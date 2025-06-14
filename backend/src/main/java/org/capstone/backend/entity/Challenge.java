package org.capstone.backend.entity;

import lombok.*;
import jakarta.persistence.*;
import org.capstone.backend.utils.enums.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@EntityListeners(AuditingEntityListener.class)  // Thêm dòng này để Spring quản lý các trường audit
@Table(name = "challenge")
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "challenge_id")
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "summary")
    private String summary;

    @Column(name = "picture")
    private String picture;

    @Column(name = "banner")
    private String banner;

    @Column(name = "description", columnDefinition = "LONGTEXT")
    private String description;


    @Enumerated(EnumType.STRING)
    @Column(name = "privacy", nullable = false)
    private PrivacyStatus privacy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ChallengeStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_type")
    private VerificationType verificationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "participation_type", nullable = false)
    private ParticipationType participationType;


    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @CreatedBy
    @Column(name = "created_by", nullable = false, updatable = false)
    private String createdBy;

    @Column(name = "max_groups", nullable = true)
    private Integer maxGroups;

    /** Số thành viên tối đa mỗi nhóm */
    @Column(name = "max_members_per_group", nullable = true)
    private Integer maxMembersPerGroup;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_type_id", nullable = false)
    private ChallengeType challengeType;

    @OneToMany(mappedBy = "challenge", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChallengeMember> challengeMembers = new ArrayList<>();

    @Column(name = "admin_note")
    private String adminNote;



}
