package org.capstone.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "global_group_ranking")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GlobalGroupRanking {

    @Id
    private Long groupId;

    @Column(nullable = false)
    private String groupName;

    @Column(name = "total_stars", nullable = false)
    private Double totalStars;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}
