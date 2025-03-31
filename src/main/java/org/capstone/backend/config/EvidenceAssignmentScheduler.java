package org.capstone.backend.config;

import org.capstone.backend.repository.ChallengeRepository;
import org.capstone.backend.service.evidence.EvidenceService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class EvidenceAssignmentScheduler {

    private final EvidenceService assignmentService;
    private final ChallengeRepository challengeRepository;

    public EvidenceAssignmentScheduler(EvidenceService assignmentService,
                                       ChallengeRepository challengeRepository) {
        this.assignmentService = assignmentService;
        this.challengeRepository = challengeRepository;
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