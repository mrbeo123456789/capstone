package org.capstone.backend.listener;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.event.FirstChallengeJoinedEvent;
import org.capstone.backend.repository.ChallengeMemberRepository;
import org.capstone.backend.service.achivement.AchievementService;
import org.capstone.backend.utils.enums.AchievementType;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FirstChallengeJoinedListener {

    private final AchievementService achievementService;
    private final  ChallengeMemberRepository challengeMemberRepository;
    @Async("taskExecutor")
    @EventListener
    public void handleFirstChallengeJoined(FirstChallengeJoinedEvent event) {
        Long memberId = event.member().getId();
        boolean hasJoinedBefore = challengeMemberRepository.hasJoinedAnyChallengeBefore(memberId);
        if (!hasJoinedBefore) {
            achievementService.unlockAchievementIfEligible(memberId, AchievementType.FIRST_TRY);
        }
    }

}
