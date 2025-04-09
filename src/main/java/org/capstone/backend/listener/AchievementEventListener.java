package org.capstone.backend.listener;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.entity.ChallengeMember;
import org.capstone.backend.entity.Member;
import org.capstone.backend.event.AchievementTriggerEvent;
import org.capstone.backend.repository.ChallengeMemberRepository;
import org.capstone.backend.repository.ChallengeRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.service.achivement.AchievementService;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AchievementEventListener {

    private final MemberRepository memberRepository;
    private final ChallengeRepository challengeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final AchievementService achievementService;

    @Async
    @EventListener
    public void handle(AchievementTriggerEvent event) {
        Member member = memberRepository.findById(event.getMemberId())
                .orElseThrow(() -> new RuntimeException("Member not found"));

        switch (event.getType()) {
            case CREATE_CHALLENGE -> checkCreateChallenge(member);
            case JOIN_CHALLENGE -> {
                checkJoinChallenge(member);
                //checkJoinGroupChallenge(member);
            }
            case COMPLETE_CHALLENGE -> checkCompleteChallenge(member);
        //    case SUBMIT_EVIDENCE -> checkSubmitEvidence(member, event.getChallengeId());
        }
    }

    private void checkCreateChallenge(Member member) {
        if (challengeRepository.countByCreatedBy(member.getId()) == 1) {
            achievementService.grantAchievement(member, "A1"); // Người tiên phong
        }
    }

    private void checkJoinChallenge(Member member) {
        if (challengeMemberRepository.countByMemberId(member.getId()) == 1) {
            achievementService.grantAchievement(member, "A2"); // Tân binh
        }
    }

    private void checkCompleteChallenge(Member member) {
        if (challengeMemberRepository.countByMemberIdAndIsCompletedTrue(member.getId()) == 1) {
            achievementService.grantAchievement(member, "A3"); // Người chinh phục
        }
    }
//
//    private void checkSubmitEvidence(Member member, Long challengeId) {
//        if (challengeId == null) return; // Nếu không có challengeId thì bỏ qua
//
//        int totalDays = challengeRepository.findById(challengeId)
//                .map(ch -> ch.getTotalDays()) // cần có trường totalDays trong Challenge entity
//                .orElse(0);
//
//        long submittedDays = challengeMemberRepository.countSubmittedDays(member.getId(), challengeId);
//
//        if (submittedDays == totalDays && totalDays > 0) {
//            achievementService.grantAchievement(member, "A4"); // Bậc thầy kỷ luật
//        }
//    }

//    private void checkJoinGroupChallenge(Member member) {
//        List<ChallengeMember> joined = challengeMemberRepository.findGroupChallengesByMember(member.getId());
//        if (joined.size() == 5) {
//            achievementService.grantAchievement(member, "A5"); // Nhà đồng hành
//        }
//    }
}
