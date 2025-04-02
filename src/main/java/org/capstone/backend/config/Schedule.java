package org.capstone.backend.config;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.event.AchievementTriggerEvent;
import org.capstone.backend.repository.ChallengeRepository;
import org.capstone.backend.service.evidence.EvidenceService;
import org.capstone.backend.service.ranking.RankingService;
import org.capstone.backend.utils.enums.ChallengeStatus;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class Schedule {
    private final EvidenceService assignmentService;
    private final ChallengeRepository challengeRepository;
    private final RankingService rankingService;
    private ApplicationEventPublisher eventPublisher;

    // 🕒 Chạy mỗi ngày lúc 00:05
    @Scheduled(cron = "0 5 0 * * *")
    public void updateAllChallengeProgressRankings() {
        rankingService.recalculateAllChallengeProgressRankings();
    }

        @Scheduled(cron = "0 0 0 * * ?") // Chạy lúc 00:00 mỗi ngày
        @Transactional
        public void updateChallengeStatuses() {
            LocalDate today = LocalDate.now();

            // Cập nhật trạng thái từ UPCOMING -> ONGOING nếu đến ngày bắt đầu
            List<Challenge> startingChallenges = challengeRepository.findByStatusAndStartDate(ChallengeStatus.UPCOMING, today);
            for (Challenge challenge : startingChallenges) {
                challenge.setStatus(ChallengeStatus.ONGOING);

            }

            // Cập nhật trạng thái từ ONGOING -> FINISH nếu đến ngày kết thúc
            List<Challenge> finishingChallenges = challengeRepository.findByStatusAndEndDate(ChallengeStatus.ONGOING, today);
            for (Challenge challenge : finishingChallenges) {
                challenge.setStatus(ChallengeStatus.FINISH);
               // eventPublisher.publishEvent(
                 //       new AchievementTriggerEvent(memberId, AchievementTriggerEvent.TriggerType.COMPLETE_CHALLENGE)
             //   );


            }

            // Lưu tất cả thay đổi
            challengeRepository.saveAll(startingChallenges);
            challengeRepository.saveAll(finishingChallenges);
        }


    //@Scheduled(cron = "0 * * * * *") // mỗi phút
    // 00:10 mỗi ngày thường
    @Scheduled(cron = "0 10 0 * * *") // 00:10 mỗi ngày
    public void scheduleAssignmentForNormalDays() {
        LocalDate today = LocalDate.now();
        List<Long> challengeIds = challengeRepository.findChallengesHappeningToday(today);
        challengeIds.forEach(assignmentService::assignPendingReviewersForChallenge);
    }


    // 21:10 mỗi ngày cuối
    @Scheduled(cron = "0 10 21 * * *")
    public void scheduleAssignmentForEndDays() {
        LocalDate today = LocalDate.now();
        List<Long> challengeIds = challengeRepository.findChallengesEndingToday(today);
        challengeIds.forEach(assignmentService::assignPendingReviewersForChallenge);
    }
}
