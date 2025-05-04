package org.capstone.backend.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.capstone.backend.entity.Achievement;
import org.capstone.backend.entity.Member;
import org.capstone.backend.entity.UserAchievement;
import org.capstone.backend.event.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.service.notification.NotificationService;
import org.capstone.backend.utils.enums.AchievementType;
import org.capstone.backend.utils.enums.NotificationType;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AchievementEventListener {
    private final NotificationService notificationService;
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final EvidenceRepository evidenceRepository;
    private final EvidenceReportRepository evidenceReportRepository;
   private final MemberRepository memberRepository;
    private boolean hasAchievement(Member member, Achievement achievement) {
        return userAchievementRepository
                .findByMemberAndAchievement(member, achievement)
                .map(ua -> ua.getAchievedAt() != null)
                .orElse(false);
    }

    private void unlockInstantAchievement(Member member, AchievementType type) {
        Achievement achievement = achievementRepository.findByType(type)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại thành tựu: " + type));

        if (hasAchievement(member, achievement)) {
            log.info("❗ Member {} đã có thành tựu {}, bỏ qua.", member.getId(), type);
            return;
        }

        UserAchievement ua = UserAchievement.builder()
                .member(member)
                .achievement(achievement)
                .progress(100.0)
                .achievedAt(LocalDateTime.now())
                .build();

        userAchievementRepository.save(ua);
        log.info("✔ Gán thành tựu {} cho member {}", type, member.getId());



        notificationService.sendNotification(
                member.getAccount().getId().toString(),
                "notification.achievementUnlock.title",
                "notification.achievementUnlock.content",
                NotificationType.ACHIEVEMENT,
                Map.of("achievementName", achievement.getName())
        );

    }



    private void updateProgress(Member member, AchievementType type, double newProgress) {
        Achievement achievement = achievementRepository.findByType(type)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại thành tựu: " + type));

        UserAchievement ua = userAchievementRepository
                .findByMemberAndAchievement(member, achievement)
                .orElseGet(() -> UserAchievement.builder()
                        .member(member)
                        .achievement(achievement)
                        .progress(0.0)
                        .build()
                );

        boolean alreadyUnlocked = ua.getAchievedAt() != null;

        // Nếu đã đạt thành tựu và không có tiến bộ mới => bỏ qua
        if (alreadyUnlocked && ua.getProgress() >= 100.0) {
            log.info("❗ Member {} đã có thành tựu {} với progress {}, bỏ qua.", member.getId(), type, ua.getProgress());
            return;
        }

        double current = ua.getProgress() == null ? 0.0 : ua.getProgress();
        double updated = Math.max(current, newProgress);
        ua.setProgress(updated);

        if (!alreadyUnlocked && updated >= 100.0) {
            ua.setAchievedAt(LocalDateTime.now());
            log.info("✔ Member {} đạt thành tựu {}", member.getId(), type);

            // ✅ Gửi thông báo khi vừa đạt

            notificationService.sendNotification(
                    member.getAccount().getId().toString(),
                    "notification.achievementUnlock.title",
                    "notification.achievementUnlock.content",
                    NotificationType.ACHIEVEMENT,
                    Map.of("achievementName", achievement.getName())
            );

        }

        userAchievementRepository.save(ua);
    }

    @EventListener
    public void handleFirstJoinChallenge(FirstJoinChallengeEvent event) {
        Member member = event.member();
        long joinedCount = challengeMemberRepository.countJoinedChallengesByMember(member);

        // 🎯 Thành tựu FIRST_TRY – tham gia lần đầu
        if (joinedCount == 1) {
            unlockInstantAchievement(member, AchievementType.FIRST_TRY);
        } else {
            log.info("❌ Member {} đã tham gia {} thử thách => không phải lần đầu", member.getId(), joinedCount);
        }

        // 🧱 Thành tựu RISING_STAR – tham gia 5 thử thách
        double progress = Math.min(100.0, (joinedCount / 5.0) * 100.0);
        updateProgress(member, AchievementType.RISING_STAR, progress);
    }


    private boolean isProfileComplete(Member member) {
        return isNotBlank(member.getFullName()) &&
                isNotBlank(member.getGender()) &&
                isNotBlank(member.getPhone()) &&
                isNotBlank(member.getAvatar()) &&
                isNotBlank(member.getWard()) &&
                isNotBlank(member.getDistrict()) &&
                isNotBlank(member.getProvince()) &&
                member.getDateOfBirth() != null;
    }

    private boolean isNotBlank(String value) {
        return value != null && !value.trim().isEmpty();
    }

    @EventListener
    public void handleDailyEvidenceSubmitted(DailyEvidenceSubmittedEvent event) {
        Member member = event.member();

        // 🎯 NIGHT_OWL – Nộp sau 10h đêm
        int currentHour = LocalDateTime.now().getHour();
        if (currentHour >= 22) {
            unlockInstantAchievement(member, AchievementType.NIGHT_OWL);
        }

        // 🧱 STREAK_MASTER – Nộp 30 ngày liên tiếp
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        int streak = 0;
        for (int i = 0; i < 30; i++) {
            LocalDateTime dayStart = todayStart.minusDays(i);
            LocalDateTime dayEnd = dayStart.plusDays(1);

            boolean submitted = evidenceRepository.existsByMemberAndSubmittedAtBetween(member, dayStart, dayEnd);
            if (submitted) {
                streak++;
            } else {
                break;
            }
        }

        if (streak == 30) {
            unlockInstantAchievement(member, AchievementType.STREAK_MASTER);
        } else {
            double progress = (streak / 30.0) * 100.0;
            updateProgress(member, AchievementType.STREAK_MASTER, progress);
            log.info("⏳ Member {} có streak {} ngày => progress: {}%", member.getId(), streak, progress);
        }

        // 📌 Thành tựu CONTRIBUTOR – nộp 20 bằng chứng
        long totalSubmitted = evidenceRepository.countByMember(member);
        double progressContributor = Math.min(100.0, (totalSubmitted / 20.0) * 100.0);
        updateProgress(member, AchievementType.CONTRIBUTOR, progressContributor);
    }



    @EventListener
    public void handleProfileUpdated(ProfileUpdatedEvent event) {
        Member member = event.member();

        if (isProfileComplete(member)) {
            unlockInstantAchievement(member, AchievementType.PROFILE_MASTER);
        } else {
            log.info("❌ Member {} chưa đủ thông tin hồ sơ.", member.getId());
        }
    }

    @EventListener
    public void handleTrendingChallenge(TrendingChallengeReachedEvent event) {
        Member host = event.host();
        long totalParticipants = event.participantCount();

        if (totalParticipants >= 100) {
            unlockInstantAchievement(host, AchievementType.TRENDING_CREATOR);
        } else {
            log.info("❌ Host {} chưa đủ 100 người tham gia thử thách (hiện tại: {})", host.getId(), totalParticipants);
        }
    }
    @EventListener
    public void handleGlobalTopGroup(GlobalRankingTopGroupUpdatedEvent event) {
        Long groupId = event.groupId();

        memberRepository.findGroupOwnerByGroupId(groupId).ifPresent(owner ->
                unlockInstantAchievement(owner, AchievementType.GROUP_LEGEND)
        );
    }
    @EventListener
    public void handleGlobalTopMembers(GlobalRankingTopMembersUpdatedEvent event) {
        for (Member member : event.topMembers()) {
            unlockInstantAchievement(member, AchievementType.FITNESS_CHAMPION);
        }
    }
    @EventListener
    public void handleEvidenceVoted(EvidenceVotedEvent event) {
        Member voter = event.voter();

        long count = evidenceReportRepository.countByReviewer(voter); // ✅ Viết query tương ứng

        double progress = Math.min(100.0, (count / 10.0) * 100.0);
        updateProgress(voter, AchievementType.ACTIVE_VOTER, progress);

        log.info("🗳️ Member {} đã chấm {} bằng chứng => progress: {}%", voter.getId(), count, progress);
    }

}
