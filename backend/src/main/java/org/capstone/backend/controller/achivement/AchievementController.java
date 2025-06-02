package org.capstone.backend.controller.achivement;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.achivement.UserAchievementResponse;
import org.capstone.backend.service.achivement.AchievementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@RequiredArgsConstructor
public class AchievementController {

    private final AchievementService achievementService;

    @GetMapping("/my")
    public ResponseEntity<List<UserAchievementResponse>> getMyAchievements() {
        return ResponseEntity.ok(achievementService.getMyAchievements());
    }
}
