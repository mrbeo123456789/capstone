package org.capstone.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.capstone.backend.utils.enums.AchievementType;
import org.capstone.backend.utils.enums.AchievementCategory;

@Entity
@Table(name = "achievement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, unique = true)
    private AchievementType type; // VD: FIRST_TRY, STREAK_MASTER...

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private AchievementCategory category; // SINGLE_CONDITION, CUMULATIVE...

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;


    @Column(name = "has_progress", nullable = false)
    private boolean hasProgress; // true nếu có progress bar
}
