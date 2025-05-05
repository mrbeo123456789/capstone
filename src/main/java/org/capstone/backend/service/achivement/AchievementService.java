package org.capstone.backend.service.achivement;

import org.capstone.backend.dto.achivement.UserAchievementResponse;
import org.capstone.backend.entity.Member;
import org.capstone.backend.utils.enums.AchievementType;

import java.util.List;

public interface AchievementService {
    List<UserAchievementResponse> getMyAchievements();

}
