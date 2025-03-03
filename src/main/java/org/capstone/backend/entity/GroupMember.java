package org.capstone.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_member_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Groups group;  // Updated from Group to Groups

    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "created_by", updatable = false)
    private Long createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private Long updatedBy;

    @PrePersist
    protected void onCreate() {
        createdBy = 1L; // Just for testing, replace with real user ID
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
