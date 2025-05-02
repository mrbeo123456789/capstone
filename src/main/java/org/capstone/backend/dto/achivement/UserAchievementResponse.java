package org.capstone.backend.dto.achivement;

import lombok.Builder;
import lombok.Data;
import org.capstone.backend.utils.enums.AchievementType;

import java.time.LocalDateTime;

@Data
@Builder
public class UserAchievementResponse {
    private AchievementType type;
    private String name;
    private String description;
    private boolean unlocked;
    private double progress;
    private LocalDateTime achievedAt;
    private boolean hasProgress;
}
