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

            // 1. Gửi Notification
            notificationService.sendNotification(
                    userId,
                    "Thử thách '" + challengeName + "' đã bắt đầu!",
                    "Hãy sẵn sàng chinh phục thử thách '" + challengeName + "' cùng GoBeyond!",
                    NotificationType.CHALLENGE_STARTED
            );

            // 2. Gửi Gmail
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
            // Có thể log lỗi nếu cần (ví dụ: logger.error(...))
        }
    }
}
