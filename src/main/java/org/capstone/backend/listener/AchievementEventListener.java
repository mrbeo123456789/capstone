package org.capstone.backend.listener;


import lombok.AllArgsConstructor;
import org.capstone.backend.entity.Member;
import org.capstone.backend.event.AchievementTriggerEvent;
import org.capstone.backend.repository.ChallengeMemberRepository;
import org.capstone.backend.repository.ChallengeRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.service.achivement.AchievementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class AchievementEventListener {


    private MemberRepository memberRepository;


    private ChallengeRepository challengeRepository;


    private ChallengeMemberRepository challengeMemberRepository;


    private AchievementService achievementService;

    @Async
    @EventListener
    public void handleAchievementTrigger(AchievementTriggerEvent event) {
        Member member = memberRepository.findById(event.getMemberId())
                .orElseThrow(() -> new RuntimeException("Member not found"));

        switch (event.getType()) {
            case CREATE_CHALLENGE -> {
                int count = challengeRepository.countByCreatedBy(member.getId());
                if (count == 1) {
                    achievementService.grantAchievement(member, "A1");
                }
            }
            case JOIN_CHALLENGE -> {
                int count = challengeMemberRepository.countByMemberId(member.getId());
                if (count == 1) {
                    achievementService.grantAchievement(member, "A2");
                }
            }
            case COMPLETE_CHALLENGE -> {
                int count = challengeMemberRepository.countByMemberIdAndIsCompletedTrue(member.getId());
                if (count == 1) {
                    achievementService.grantAchievement(member, "A3");
                }
            }
        }
    }
}
