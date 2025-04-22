package org.capstone.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeMember;
import org.capstone.backend.entity.EvidenceReport;
import org.capstone.backend.entity.GroupChallenge;
import org.capstone.backend.event.ChallengeResultAnnounceEvent;
import org.capstone.backend.event.ChallengeStartedEvent;
import org.capstone.backend.repository.*;
import org.capstone.backend.service.evidence.EvidenceService;
import org.capstone.backend.service.ranking.RankingService;
import org.capstone.backend.utils.enums.*;
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
    private final EvidenceReportRepository evidenceReportRepository;
    private final EvidenceRepository evidenceRepository;
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

        challengeRepository.saveAll(Stream.concat(toStart, toFinish).toList());

        markMemberCompletion(today);
        updateGroupChallengeStatuses(today);
    }

    // ===== 🕒 00:02 – Gửi sự kiện công bố kết quả cho các thử thách vừa kết thúc =====
    @Scheduled(cron = "0 2 0 * * *", zone = "Asia/Bangkok")
    public void announceResults() {
        LocalDate today = LocalDate.now();
        challengeRepository.findByStatusAndEndDate(ChallengeStatus.FINISH, today)
                .forEach(ch -> {
                    eventPublisher.publishEvent(new ChallengeResultAnnounceEvent(ch));
                    log.info("Announced result for challenge {}", ch.getId());
                });
    }

    // ===== 🕓 00:10 – Tính điểm sao và tiến độ cá nhân cho tất cả thử thách đang diễn ra =====
    @Scheduled(cron = "0 10 0 * * *", zone = "Asia/Bangkok")
    public void updateStarRatingsAndGlobalRankings() {
        rankingService.updateChallengeStarRatings();
        rankingService.recalculateAllChallengeProgressRankings();
        log.debug("Updated star ratings & global ranking");
    }

    // ===== 🕔 00:15 – Gán reviewer tự động cho thử thách MEMBER_REVIEW trong ngày =====
    @Scheduled(cron = "0 15 0 * * *", zone = "Asia/Bangkok")
    public void assignDailyReviewers() {
        challengeRepository
                .findCrossCheckChallengesHappeningToday(ChallengeStatus.ONGOING, VerificationType.MEMBER_REVIEW)
                .forEach(assignmentService::assignPendingReviewersForChallenge);
    }

    // ===== 🗓 Chủ Nhật hàng tuần lúc 01:00 – Cập nhật bảng xếp hạng tổng thể (cá nhân + nhóm) =====
    @Scheduled(cron = "0 0 1 * * SUN", zone = "Asia/Bangkok")
    public void updateWeeklyGlobalRankings() {
        rankingService.updateGlobalRanking();                  // xếp hạng cá nhân
        rankingService.calculateAndSaveGlobalGroupRanking();   // xếp hạng nhóm
        log.debug("✅ [WEEKLY] Updated global member & group rankings (Sunday 01:00)");
    }


    // ===== 🌙 21:02 – Gán reviewer cuối ngày cho thử thách kết thúc hôm nay =====
    @Scheduled(cron = "0 2 21 * * *", zone = "Asia/Bangkok")
    public void assignEndDayReviewers() {
        LocalDate today = LocalDate.now();
        challengeRepository
                .findChallengesEndingToday(today)
                .forEach(assignmentService::assignPendingReviewersForChallenge);
    }

    @Transactional
    protected void markMemberCompletion(LocalDate today) {
        challengeRepository.findByStatusAndEndDate(ChallengeStatus.FINISH, today)
                .forEach(ch -> {
                    VerificationType verificationType = ch.getVerificationType();
                    LocalDate startDate = ch.getStartDate();
                    LocalDate endDate = ch.getEndDate();
                    Long challengeId = ch.getId();

                    List<ChallengeMember> members = challengeMemberRepository.findByChallenge(ch);

                    members.forEach(cm -> {
                        boolean completed = false;

                        if (Boolean.TRUE.equals(cm.getIsParticipate())) {
                            Long memberId = cm.getMember().getId();

                            double completionRate = verificationType == VerificationType.HOST_REVIEW
                                    ? evidenceService.getApprovedEvidencePercentage(memberId, challengeId) / 100.0
                                    : calculateCompletionRate(memberId, challengeId, verificationType, startDate, endDate);

                            completed = completionRate >= 0.8;
                        }

                        cm.setIsCompleted(completed);
                    });

                    challengeMemberRepository.saveAll(members);
                    log.info("✅ Marked isCompleted for challenge {}", ch.getId());
                });
    }


    @Transactional
    protected void updateGroupChallengeStatuses(LocalDate today) {
        List<GroupChallenge> successList = groupChallengeRepository
                .findGroupChallengesByStatusAndEndDate(GroupChallengeStatus.ONGOING, today)
                .stream()
                .filter(gc -> gc.getChallenge().getParticipationType() == ParticipationType.GROUP)
                .filter(gc -> {
                    var challenge = gc.getChallenge();
                    var verificationType = challenge.getVerificationType();
                    var members = challengeMemberRepository
                            .findByChallengeAndGroupId(challenge, gc.getGroup().getId());

                    if (members.isEmpty()) return false;

                    LocalDate startDate = challenge.getStartDate();
                    LocalDate endDate = challenge.getEndDate();
                    Long challengeId = challenge.getId();

                    double totalCompletionRate = 0.0;
                    int memberCount = 0;

                    for (ChallengeMember cm : members) {
                        if (!Boolean.TRUE.equals(cm.getIsParticipate())) continue;

                        Long memberId = cm.getMember().getId();

                        double rate = verificationType == VerificationType.HOST_REVIEW
                                ? evidenceService.getApprovedEvidencePercentage(memberId, challengeId) / 100.0
                                : calculateCompletionRate(memberId, challengeId, verificationType, startDate, endDate);

                        totalCompletionRate += rate;
                        memberCount++;
                    }

                    double avgCompletionRate = memberCount == 0 ? 0.0 : totalCompletionRate / memberCount;
                    return avgCompletionRate >= 0.8;
                })
                .peek(gc -> {
                    gc.setSuccess(true);
                    log.info("✅ Marked GroupChallenge {} successful", gc.getId());
                })
                .toList();

        groupChallengeRepository.saveAll(successList);
    }

    private double calculateCompletionRate(
            Long memberId,
            Long challengeId,
            VerificationType verificationType,
            LocalDate startDate,
            LocalDate endDate
    ) {
        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        int completedDays = 0;

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            boolean hasApprovedEvidence = evidenceRepository
                    .findByMemberIdAndChallengeIdAndDate(memberId, challengeId, date)
                    .map(e -> e.getStatus() == EvidenceStatus.APPROVED)
                    .orElse(false);

            if (verificationType == VerificationType.HOST_REVIEW) {
                if (hasApprovedEvidence) {
                    completedDays++;
                }
            } else if (verificationType == VerificationType.MEMBER_REVIEW) {
                List<EvidenceReport> reviews = evidenceReportRepository
                        .findByReviewerIdAndChallengeIdAndAssignedDate(memberId, challengeId, date);
                boolean allReviewed = reviews.stream().allMatch(r -> r.getReviewedAt() != null);
                if (hasApprovedEvidence && allReviewed) {
                    completedDays++;
                }
            }
        }

        return (double) completedDays / totalDays;
    }

}
