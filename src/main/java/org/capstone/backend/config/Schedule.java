package org.capstone.backend.config;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeMember;
import org.capstone.backend.entity.GroupChallenge;
import org.capstone.backend.event.ChallengeResultAnnounceEvent;
import org.capstone.backend.event.ChallengeStartedEvent;
import org.capstone.backend.repository.ChallengeMemberRepository;
import org.capstone.backend.repository.ChallengeRepository;
import org.capstone.backend.repository.GroupChallengeRepository;
import org.capstone.backend.service.evidence.EvidenceService;
import org.capstone.backend.service.ranking.RankingService;
import org.capstone.backend.utils.enums.ChallengeStatus;
import org.capstone.backend.utils.enums.GroupChallengeStatus;
import org.capstone.backend.utils.enums.ParticipationType;
import org.capstone.backend.utils.enums.VerificationType;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Transactional
@Component
@RequiredArgsConstructor
public class Schedule {

    private final EvidenceService assignmentService;
    private final EvidenceService evidenceService;
    private final ChallengeRepository challengeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final GroupChallengeRepository groupChallengeRepository;
    private final RankingService rankingService;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void updateChallengeStatuses() {
        LocalDate today = LocalDate.now();

        // 1. Update thử thách từ UPCOMING -> ONGOING
        List<Challenge> startingChallenges = challengeRepository.findByStatusAndStartDate(ChallengeStatus.UPCOMING, today);
        startingChallenges.forEach(challenge -> {
            challenge.setStatus(ChallengeStatus.ONGOING);
            eventPublisher.publishEvent(new ChallengeStartedEvent(challenge)); // 🔥 Bắn sự kiện khi bắt đầu
        });

        // 2. Update thử thách từ ONGOING -> FINISH
        List<Challenge> finishingChallenges = challengeRepository.findByStatusAndEndDate(ChallengeStatus.ONGOING, today);
        finishingChallenges.forEach(challenge -> challenge.setStatus(ChallengeStatus.FINISH));

        // 3. Gộp lại tất cả challenges để save
        List<Challenge> challengesToUpdate = Stream.concat(
                startingChallenges.stream(),
                finishingChallenges.stream()
        ).collect(Collectors.toList());

        challengeRepository.saveAll(challengesToUpdate);
    }

    @Transactional
    public void updateGroupChallengeStatuses(LocalDate today) {
        List<GroupChallenge> updatedGroupChallenges = groupChallengeRepository
                .findGroupChallengesByStatusAndEndDate(GroupChallengeStatus.ONGOING, today)
                .stream()
                .filter(gc -> gc.getChallenge().getParticipationType() == ParticipationType.GROUP)
                .filter(gc -> {
                    List<ChallengeMember> challengeMembers = challengeMemberRepository.findByChallengeAndGroupId(
                            gc.getChallenge(), gc.getGroup().getId());
                    if (challengeMembers.isEmpty()) {
                        return false;
                    }
                    LocalDate startDate = gc.getChallenge().getStartDate();
                    long daysInChallenge = java.time.temporal.ChronoUnit.DAYS.between(startDate, today) + 1;
                    long totalEvidenceNeeded = challengeMembers.size() * daysInChallenge;
                    long totalEvidenceSubmitted = challengeMembers.stream()
                            .mapToLong(member -> evidenceService.getSubmittedEvidenceCount(
                                    member.getMember().getId(),
                                    gc.getChallenge().getId(),
                                    startDate,
                                    today))
                            .sum();
                    double submissionPercentage = (totalEvidenceSubmitted * 100.0) / totalEvidenceNeeded;
                    return submissionPercentage >= 80.0;
                })
                .peek(gc -> gc.setSuccess(true))
                .collect(Collectors.toList());

        groupChallengeRepository.saveAll(updatedGroupChallenges);
    }

    @Scheduled(cron = "0 15 0 * * *")
    @Transactional
    public void updateChallengeMemberCompletionStatus() {
        LocalDate today = LocalDate.now();

        challengeRepository.findByStatusAndEndDate(ChallengeStatus.FINISH, today)
                .forEach(challenge -> {
                    List<ChallengeMember> updatedMembers = challengeMemberRepository.findByChallenge(challenge)
                            .stream()
                            .peek(member -> {
                                double approvedPercentage = evidenceService.getApprovedEvidencePercentage(
                                        member.getMember().getId(), challenge.getId());
                                if (approvedPercentage >= 80.0) {
                                    member.setIsCompleted(true);
                                }
                            })
                            .collect(Collectors.toList());
                    challengeMemberRepository.saveAll(updatedMembers);
                });
    }

    @Scheduled(cron = "0 30 0 * * *")
    @Transactional
    public void announceChallengeResults() {
        LocalDate today = LocalDate.now();
        List<Challenge> finishedChallenges = challengeRepository.findByStatusAndEndDate(ChallengeStatus.FINISH, today);

        for (Challenge challenge : finishedChallenges) {
            eventPublisher.publishEvent(new ChallengeResultAnnounceEvent(challenge));
        }
    }

    @Scheduled(cron = "0 * * * * *")
    public void updateAllChallengeProgressRankings() {
        rankingService.recalculateAllChallengeProgressRankings();
    }

    @Scheduled(cron = "0 10 0 * * *")
    public void scheduleAssignmentForNormalDays() {
        challengeRepository.findCrossCheckChallengesHappeningToday(ChallengeStatus.ONGOING, VerificationType.MEMBER_REVIEW)
                .forEach(assignmentService::assignPendingReviewersForChallenge);
    }

    @Scheduled(cron = "0 10 21 * * *")
    public void scheduleAssignmentForEndDays() {
        LocalDate today = LocalDate.now();
        challengeRepository.findChallengesEndingToday(today)
                .forEach(assignmentService::assignPendingReviewersForChallenge);
    }

    @Scheduled(cron = "0 * * * * *")
    public void scheduledStarRatingUpdate() {
        rankingService.updateChallengeStarRatings();
    }

    @Scheduled(cron = "0 * * * * *")
    public void refreshGlobalRanking() {
        rankingService.updateGlobalRanking();
    }
}