package org.capstone.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.capstone.backend.utils.enums.ReportStatus;
import org.capstone.backend.utils.enums.ReportType;

import java.time.LocalDateTime;

@Entity
@Table(name = "challenge_report")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private Member reporter;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ReportStatus status; // e.g. PENDING, APPROVED, REJECTED

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private ReportType reportType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ReportStatus.PENDING;
        }
    }
}
