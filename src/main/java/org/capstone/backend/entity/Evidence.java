package org.capstone.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.capstone.backend.utils.enums.EvidenceStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "evidence",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"member_id", "challenge_id", "submitted_at"}
        ))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;


    @Column(name = "evidence_url", nullable = false)
    private String evidenceUrl;

    @Enumerated(EnumType.STRING)
    private EvidenceStatus status; // PENDING, APPROVED, REJECTED

    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private Long updatedBy;
    @OneToMany(mappedBy = "evidence", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<EvidenceReport> evidenceReports;


    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
