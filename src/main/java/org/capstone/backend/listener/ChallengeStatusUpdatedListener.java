package org.capstone.backend.listener;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.event.ChallengeStatusUpdatedEvent;
import org.capstone.backend.repository.ChallengeMemberRepository;
import org.capstone.backend.service.notification.NotificationService;
import org.capstone.backend.utils.enums.NotificationType;
import org.capstone.backend.utils.sendmail.FixedGmailService;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChallengeStatusUpdatedListener {

    private final ChallengeMemberRepository challengeMemberRepository;
    private final NotificationService notificationService;
    private final FixedGmailService fixedGmailService;

    @Async("taskExecutor")
    @EventListener
    public void handleChallengeStatusUpdated(ChallengeStatusUpdatedEvent event) {
        Challenge challenge = event.challenge();
        String status = event.newStatus();
        String challengeName = challenge.getName();

        challengeMemberRepository.findByChallenge(challenge).forEach(member -> {
            String userId = member.getMember().getId().toString();
            String fullName = member.getMember().getFullName();
            String email = member.getMember().getAccount().getEmail();

            // Gửi Notification
            notificationService.sendNotification(
                    userId,
                    "Cập nhật thử thách",
                    "Thử thách '" + challengeName + "' đã được cập nhật trạng thái: " + status,
                    NotificationType.SYSTEM_ANNOUNCEMENT
            );

            // Gửi Email
            try {
                String subject = "Cập nhật trạng thái thử thách '" + challengeName + "'";
                String body = String.format("""
                        Xin chào %s,

                        Thử thách '%s' mà bạn tham gia đã được cập nhật trạng thái: %s.

                        Vui lòng kiểm tra thử thách để nắm rõ thông tin mới nhất.

                        Trân trọng,
                        Đội ngũ GoBeyond
                        """, fullName, challengeName, status);

                fixedGmailService.sendEmail(email, subject, body);
            } catch (Exception e) {
                // Log lỗi nếu cần
            }
        });
    }
}
