package org.capstone.backend.listener;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeMember;
import org.capstone.backend.entity.GroupChallenge;
import org.capstone.backend.event.ChallengeResultAnnounceEvent;
import org.capstone.backend.repository.ChallengeMemberRepository;
import org.capstone.backend.repository.GroupChallengeRepository;
import org.capstone.backend.service.notification.NotificationService;
import org.capstone.backend.utils.enums.NotificationType;
import org.capstone.backend.utils.enums.ParticipationType;
import org.capstone.backend.utils.sendmail.FixedGmailService;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ChallengeResultAnnounceListener {

    private final ChallengeMemberRepository challengeMemberRepository;
    private final GroupChallengeRepository groupChallengeRepository;
    private final NotificationService notificationService;
    private final FixedGmailService fixedGmailService;

    @Async("taskExecutor")
    @EventListener
    public void handleChallengeResultAnnounce(ChallengeResultAnnounceEvent event) {
        Challenge challenge = event.challenge();
        String challengeName = challenge.getName();

        if (challenge.getParticipationType() == ParticipationType.INDIVIDUAL) {
            challengeMemberRepository.findByChallenge(challenge).stream()
                    .filter(member -> Boolean.TRUE.equals(member.getIsCompleted()))
                    .forEach(member -> {
                        String userId = member.getMember().getId().toString();
                        String email = member.getMember().getAccount().getEmail();
                        String fullName = member.getMember().getFullName();

                        // Gửi notification i18n
                        Map<String, String> data = new HashMap<>();
                        data.put("challengeName", challengeName);

                        notificationService.sendNotification(
                                userId,
                                "notification.challengeResult.title",
                                "notification.challengeResult.content",
                                NotificationType.CHALLENGE_RESULT,
                                data

                        );

                        // Gửi email
                        sendChallengeResultEmail(email, fullName, challengeName, true);
                    });
        } else if (challenge.getParticipationType() == ParticipationType.GROUP) {
            groupChallengeRepository.findByChallengeId(challenge.getId()).stream()
                    .filter(GroupChallenge::isSuccess)
                    .forEach(gc -> {
                        List<ChallengeMember> groupMembers = challengeMemberRepository.findByChallengeAndGroupId(challenge, gc.getGroup().getId());
                        for (ChallengeMember member : groupMembers) {
                            String userId = member.getMember().getId().toString();
                            String email = member.getMember().getAccount().getEmail();
                            String fullName = member.getMember().getFullName();
                            String groupName = gc.getGroup().getName();

                            // Gửi notification i18n
                            Map<String, String> data = new HashMap<>();
                            data.put("challengeName", challengeName);
                            data.put("groupName", groupName);

                            notificationService.sendNotification(
                                    userId,
                                    "notification.groupChallengeResult.title",
                                    "notification.groupChallengeResult.content",
                                    NotificationType.CHALLENGE_RESULT,
                                    data
                            );

                            // Gửi email
                            sendGroupChallengeResultEmail(email, fullName, groupName, challengeName, true);
                        }
                    });
        }
    }

    private void sendChallengeResultEmail(String toEmail, String fullName, String challengeName, boolean isCompleted) {
        try {
            String subject = "Kết quả thử thách '" + challengeName + "'";
            String body = String.format("""
                    Xin chào %s,

                    Bạn đã %s thử thách '%s'!

                    Hãy xem bảng thành tích và tiếp tục chinh phục những thử thách mới cùng GoBeyond nhé.

                    Trân trọng,
                    Đội ngũ GoBeyond
                    """, fullName, isCompleted ? "hoàn thành xuất sắc" : "không hoàn thành", challengeName);

            fixedGmailService.sendEmail(toEmail, subject, body);
        } catch (Exception e) {
            // Ghi log lỗi nếu cần
        }
    }

    private void sendGroupChallengeResultEmail(String toEmail, String fullName, String groupName, String challengeName, boolean isCompleted) {
        try {
            String subject = "Kết quả thử thách nhóm '" + challengeName + "'";
            String body = String.format("""
                    Xin chào %s,

                    Nhóm '%s' của bạn đã %s thử thách '%s'!

                    Hãy cùng đồng đội xem lại hành trình vừa qua và chuẩn bị cho những mục tiêu tiếp theo!

                    Trân trọng,
                    Đội ngũ GoBeyond
                    """, fullName, groupName, isCompleted ? "hoàn thành xuất sắc" : "không hoàn thành", challengeName);

            fixedGmailService.sendEmail(toEmail, subject, body);
        } catch (Exception e) {
            // Ghi log lỗi nếu cần
        }
    }
}
