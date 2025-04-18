package org.capstone.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.capstone.backend.entity.Challenge;
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
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Stream;

@Slf4j
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

    // ==== 00:00 – Roll UPCOMING → ONGOING & ONGOING → FINISH ====
    @Transactional
    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Bangkok")
    public void rollChallengeStatuses() {
        LocalDate today = LocalDate.now();

        var toStart = challengeRepository
                .findByStatusAndStartDate(ChallengeStatus.UPCOMING, today)
                .stream()
                .peek(ch -> {
                    ch.setStatus(ChallengeStatus.ONGOING);
                    eventPublisher.publishEvent(new ChallengeStartedEvent(ch));
                    log.info("Challenge {} started", ch.getId());
                });

        var toFinish = challengeRepository
                .findByStatusAndEndDate(ChallengeStatus.ONGOING, today)
                .stream()
                .peek(ch -> {
                    ch.setStatus(ChallengeStatus.FINISH);
                    log.info("Challenge {} finished", ch.getId());
                });

        // persist both start & finish updates
        challengeRepository.saveAll(
                Stream.concat(toStart, toFinish).toList()
        );

        // now that some challenges have just finished, run their post‑finish logic:
        markMemberCompletion(today);
        updateGroupChallengeStatuses(today);
    }

    // ==== 00:05 – Assign daily cross‑check reviewers ====
    @Scheduled(cron = "0 5 0 * * *", zone = "Asia/Bangkok")
    public void assignDailyReviewers() {
        challengeRepository
                .findCrossCheckChallengesHappeningToday(ChallengeStatus.ONGOING, VerificationType.MEMBER_REVIEW)
                .forEach(assignmentService::assignPendingReviewersForChallenge);
    }

    // ==== 00:15 – Announce results ====
    @Scheduled(cron = "0 15 0 * * *", zone = "Asia/Bangkok")
    public void announceResults() {
        LocalDate today = LocalDate.now();
        challengeRepository.findByStatusAndEndDate(ChallengeStatus.FINISH, today)
                .forEach(ch -> {
                    eventPublisher.publishEvent(new ChallengeResultAnnounceEvent(ch));
                    log.info("Announced result for challenge {}", ch.getId());
                });
    }

    // ==== 00:30 – Update star ratings & global ranking (daily) ====
    @Scheduled(cron = "0 30 0 * * *", zone = "Asia/Bangkok")
    public void updateStarRatingsAndGlobalRankings() {
        rankingService.updateChallengeStarRatings();
        rankingService.updateGlobalRanking();
        log.debug("Updated star ratings & global ranking");
    }

    // ==== HH:45 – Recalculate progress ranking (hourly) ====
    @Scheduled(cron = "0 45 * * * *", zone = "Asia/Bangkok")
    public void recalculateChallengeProgressRankings() {
        rankingService.recalculateAllChallengeProgressRankings();
        log.debug("Recalculated challenge progress rankings");
    }

    // ==== 21:10 – Assign reviewers for challenges ending today ====
    @Scheduled(cron = "0 10 21 * * *", zone = "Asia/Bangkok")
    public void assignEndDayReviewers() {
        LocalDate today = LocalDate.now();
        challengeRepository
                .findChallengesEndingToday(today)
                .forEach(assignmentService::assignPendingReviewersForChallenge);
    }

    // ==== Helper invoked immediately when a challenge finishes ====
    @Transactional
    protected void markMemberCompletion(LocalDate today) {
        challengeRepository.findByStatusAndEndDate(ChallengeStatus.FINISH, today)
                .forEach(ch -> {
                    var updated = challengeMemberRepository.findByChallenge(ch)
                            .stream()
                            .peek(cm -> {
                                double pct = evidenceService.getApprovedEvidencePercentage(
                                        cm.getMember().getId(), ch.getId());
                                cm.setIsCompleted(pct >= 80.0);
                            })
                            .toList();
                    challengeMemberRepository.saveAll(updated);
                    log.info("Marked member completion for challenge {}", ch.getId());
                });
    }

    // ==== Helper invoked immediately when a challenge finishes ====
    @Transactional
    protected void updateGroupChallengeStatuses(LocalDate today) {
        List<GroupChallenge> successList = groupChallengeRepository
                .findGroupChallengesByStatusAndEndDate(GroupChallengeStatus.ONGOING, today)
                .stream()
                .filter(gc -> gc.getChallenge().getParticipationType() == ParticipationType.GROUP)
                .filter(gc -> {
                    var members = challengeMemberRepository
                            .findByChallengeAndGroupId(gc.getChallenge(), gc.getGroup().getId());
                    if (members.isEmpty()) return false;

                    long days = ChronoUnit.DAYS.between(gc.getChallenge().getStartDate(), today) + 1;
                    long required = members.size() * days;

                    long submitted = members.stream()
                            .mapToLong(m -> evidenceService.getSubmittedEvidenceCount(
                                    m.getMember().getId(),
                                    gc.getChallenge().getId(),
                                    gc.getChallenge().getStartDate(),
                                    today))
                            .sum();

                    return submitted * 100.0 / required >= 80.0;
                })
                .peek(gc -> {
                    gc.setSuccess(true);
                    log.info("Marked GroupChallenge {} successful", gc.getId());
                })
                .toList();

        groupChallengeRepository.saveAll(successList);
    }
}
