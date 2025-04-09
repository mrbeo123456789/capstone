    package org.capstone.backend.entity;

    import jakarta.persistence.*;
    import lombok.*;
    import java.time.LocalDateTime;

    @Entity
    @Table(name = "evidence_vote", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"evidence_id", "voter_id"})
    })
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class EvidenceVote {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        // Người vote
        @ManyToOne
        @JoinColumn(name = "voter_id", nullable = false)
        private Member voter;

        // Evidence được vote
        @ManyToOne
        @JoinColumn(name = "evidence_id", nullable = false)
        private Evidence evidence;

        // Số sao vote (1–5)
        @Column(nullable = false)
        private Integer score;


        @Column(name = "created_at", nullable = false, updatable = false)
        private LocalDateTime createdAt;

        @PrePersist
        protected void onCreate() {
            this.createdAt = LocalDateTime.now();
        }
    }
