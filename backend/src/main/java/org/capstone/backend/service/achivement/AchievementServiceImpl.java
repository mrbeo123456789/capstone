package org.capstone.backend.service.achivement;

import lombok.RequiredArgsConstructor;

import org.capstone.backend.dto.achivement.UserAchievementResponse;
import org.capstone.backend.entity.Achievement;
import org.capstone.backend.entity.Member;
import org.capstone.backend.entity.UserAchievement;
import org.capstone.backend.repository.AchievementRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.repository.UserAchievementRepository;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.AchievementType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AchievementServiceImpl implements AchievementService {

    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final AuthService authService;
   private final MemberRepository memberRepository;
    @Override
    public List<UserAchievementResponse> getMyAchievements() {
        Long memberId = authService.getMemberIdFromAuthentication();
        Member member = memberRepository.getReferenceById(memberId); // hoặc viết sẵn `getAuthenticatedMember()`

        Map<Long, UserAchievement> earnedMap = userAchievementRepository.findAllByMember(member)
                .stream()
                .collect(Collectors.toMap(
                        ua -> ua.getAchievement().getId(),
                        ua -> ua
                ));

        return achievementRepository.findAll()
                .stream()
                .map(achievement -> {
                    UserAchievement ua = earnedMap.get(achievement.getId());
                    return UserAchievementResponse.builder()
                            .type(achievement.getType())
                            .name(achievement.getName())
                            .description(achievement.getDescription())
                            .unlocked(ua != null)
                            .progress(ua != null ? ua.getProgress() : 0.0)
                            .achievedAt(ua != null ? ua.getAchievedAt() : null)
                            .hasProgress(achievement.isHasProgress())
                            .build();
                })
                .collect(Collectors.toList());
    }

}
