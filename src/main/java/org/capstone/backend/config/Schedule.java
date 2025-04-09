package org.capstone.backend.config;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeMember;
import org.capstone.backend.repository.ChallengeMemberRepository;
import org.capstone.backend.repository.ChallengeRepository;
import org.capstone.backend.service.evidence.EvidenceService;
import org.capstone.backend.service.ranking.RankingService;
import org.capstone.backend.utils.enums.ChallengeStatus;
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

    // Dùng cho phân bổ reviewer
    private final EvidenceService assignmentService;
    // Dùng cho tính toán phần trăm evidence được phê duyệt
    private final EvidenceService evidenceService;

    private final ChallengeRepository challengeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final RankingService rankingService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Cập nhật trạng thái của Challenge vào 00:00 mỗi ngày.
     * - Từ UPCOMING -> ONGOING khi đến ngày bắt đầu.
     * - Từ ONGOING -> FINISH khi đến ngày kết thúc.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void updateChallengeStatuses() {
        LocalDate today = LocalDate.now();

        List<Challenge> challengesToUpdate = Stream.of(
                // Truy vấn và cập nhật trạng thái từ UPCOMING -> ONGOING
                challengeRepository.findByStatusAndStartDate(ChallengeStatus.UPCOMING, today)
                        .stream()
                        .peek(challenge -> challenge.setStatus(ChallengeStatus.ONGOING)),

                // Truy vấn và cập nhật trạng thái từ ONGOING -> FINISH
                challengeRepository.findByStatusAndEndDate(ChallengeStatus.ONGOING, today)
                        .stream()
                        .peek(challenge -> challenge.setStatus(ChallengeStatus.FINISH))
        ).flatMap(s -> s).collect(Collectors.toList());

        challengeRepository.saveAll(challengesToUpdate);
    }

    /**
     * Cập nhật trạng thái hoàn thành của các thành viên khi thử thách kết thúc.
     * Chạy lúc 00:15 mỗi ngày.
     */
    @Scheduled(cron = "0 15 0 * * *")
    @Transactional
    public void updateChallengeMemberCompletionStatus() {
        LocalDate today = LocalDate.now();

        challengeRepository.findByStatusAndEndDate(ChallengeStatus.FINISH, today)
                .forEach(challenge -> {
                    // Lấy tất cả thành viên của thử thách và cập nhật trạng thái nếu đạt % chấp nhận >= 80%
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

    /**
     * Tính lại bảng xếp hạng tiến trình của Challenge vào 00:05 mỗi ngày.
     */
    @Scheduled(cron = "0 * * * * *")

  //  @Scheduled(cron = "0 5 0 * * *")
    public void updateAllChallengeProgressRankings() {
        rankingService.recalculateAllChallengeProgressRankings();
    }

    /**
     * Phân bổ reviewer cho Challenge vào 00:10 mỗi ngày đối với những Challenge đang diễn ra có kiểu xác thực MEMBER_REVIEW.
     */
    @Scheduled(cron = "0 10 0 * * *")
    public void scheduleAssignmentForNormalDays() {
        challengeRepository.findCrossCheckChallengesHappeningToday(ChallengeStatus.ONGOING, VerificationType.MEMBER_REVIEW)
                .forEach(assignmentService::assignPendingReviewersForChallenge);
    }

    /**
     * Phân bổ reviewer cho Challenge vào 21:10 mỗi ngày đối với các Challenge kết thúc trong ngày.
     */
    @Scheduled(cron = "0 10 21 * * *")
    public void scheduleAssignmentForEndDays() {
        LocalDate today = LocalDate.now();
        challengeRepository.findChallengesEndingToday(today)
                .forEach(assignmentService::assignPendingReviewersForChallenge);
    }

    /**
     * Cập nhật điểm đánh giá sao cho Challenge vào 00:35 mỗi ngày.
     */
    @Scheduled(cron = "0 * * * * *")

    // @Scheduled(cron = "0 35 0 * * *")
    public void scheduledStarRatingUpdate() {
        rankingService.updateChallengeStarRatings();
    }

    /**
     * Cập nhật bảng xếp hạng toàn cục vào 00:00 Chủ nhật hàng tuần.
     */
    @Scheduled(cron = "0 * * * * *")

    //  @Scheduled(cron = "0 0 0 * * SUN")
    public void refreshGlobalRanking() {
        rankingService.updateGlobalRanking();
    }
}
