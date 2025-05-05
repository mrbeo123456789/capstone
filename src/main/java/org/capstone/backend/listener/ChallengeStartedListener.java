package org.capstone.backend.listener;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeMember;
import org.capstone.backend.event.ChallengeStartedEvent;
import org.capstone.backend.repository.ChallengeMemberRepository;
import org.capstone.backend.service.notification.NotificationService;
import org.capstone.backend.utils.enums.NotificationType;
import org.capstone.backend.utils.sendmail.FixedGmailService;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ChallengeStartedListener {

    private final ChallengeMemberRepository challengeMemberRepository;
    private final NotificationService notificationService;
    private final FixedGmailService fixedGmailService;

    @Async("taskExecutor")
    @EventListener
    public void handleChallengeStarted(ChallengeStartedEvent event) {
        Challenge challenge = event.challenge();
        String challengeName = challenge.getName();

        challengeMemberRepository.findByChallenge(challenge).forEach(member -> {
            String userId = member.getMember().getId().toString();
            String email = member.getMember().getAccount().getEmail();
            String fullName = member.getMember().getFullName();

            // 1. Gửi Notification (đa ngôn ngữ)
            Map<String, String> data = new HashMap<>();
            data.put("challengeName", challengeName);

            notificationService.sendNotification(
                    userId,
                    "notification.challengeStarted.title",
                    "notification.challengeStarted.content",
                    NotificationType.CHALLENGE_STARTED,
                    data

            );

            // 2. Gửi Email
            sendChallengeStartedEmail(email, fullName, challengeName);
        });
    }

    private void sendChallengeStartedEmail(String toEmail, String fullName, String challengeName) {
        try {
            String subject = "Thử thách '" + challengeName + "' đã chính thức bắt đầu!";
            String body = String.format("""
                    Xin chào %s,

                    Chúng tôi xin chúc mừng bạn vì đã chính thức tham gia thử thách '%s' hôm nay!

                    Hãy luôn duy trì sự kiên trì và nỗ lực mỗi ngày để hoàn thành mục tiêu đề ra.
                    Đừng quên ghi nhận tiến trình của bạn bằng cách cập nhật bằng chứng hằng ngày nhé!

                    Chúc bạn gặt hái nhiều thành công cùng GoBeyond!

                    Trân trọng,
                    Đội ngũ GoBeyond
                    """, fullName, challengeName);

            fixedGmailService.sendEmail(toEmail, subject, body);
        } catch (Exception e) {
            // Log nếu cần
        }
    }
}
