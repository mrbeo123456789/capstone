package org.capstone.backend.service.achivement;

import lombok.AllArgsConstructor;
import org.capstone.backend.entity.Achievement;
import org.capstone.backend.entity.Member;
import org.capstone.backend.entity.UserAchievement;
import org.capstone.backend.repository.AchievementRepository;
import org.capstone.backend.repository.UserAchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class AchievementServiceImpl implements AchievementService {


//    private AchievementRepository achievementRepository;
//
//
//    private UserAchievementRepository userAchievementRepository;
//
//    public void grantAchievement(Member member, String code) {
//        Achievement achievement = achievementRepository.findByCode(code)
//                .orElseThrow(() -> new RuntimeException("Achievement not found"));
//
//        boolean alreadyHas = userAchievementRepository
//                .existsByMemberAndAchievement(member, achievement);
//
//        if (!alreadyHas) {
//            UserAchievement ua = UserAchievement.builder()
//                    .member(member)
//                    .achievement(achievement)
//                    .achievedAt(LocalDateTime.now())
//                    .build();
//            userAchievementRepository.save(ua);
//
//
//        }
//    }


}
