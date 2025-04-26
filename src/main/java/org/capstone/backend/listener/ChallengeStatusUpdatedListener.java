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

import java.util.HashMap;
import java.util.Map;

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
        String challengeName = challenge.getName();
        String statusMessage = event.newStatus();

        // Giả định nếu có " - " thì phần sau là adminNote
        String status;
        String note;

        if (statusMessage.contains(" - ")) {
            String[] parts = statusMessage.split(" - ", 2);
            status = parts[0];
            note = parts[1];
        } else {
            status = statusMessage;
            note = null;
        }

        challengeMemberRepository.findByChallenge(challenge).forEach(member -> {
            String userId = member.getMember().getId().toString();
            String fullName = member.getMember().getFullName();
            String email = member.getMember().getAccount().getEmail();

            Map<String, String> data = new HashMap<>();
            data.put("challengeName", challengeName);
            data.put("status", status);
            if (note != null) {
                data.put("adminNote", note);
            }

            // 1. Gửi Notification
            notificationService.sendNotification(
                    userId,
                    "notification.challengeStatusUpdated.title",
                    "notification.challengeStatusUpdated.content",
                    NotificationType.SYSTEM_ANNOUNCEMENT,
                    data
            );

            // 2. Gửi Email
            try {
                String subject = "Cập nhật trạng thái thử thách '" + challengeName + "'";
                String body = String.format("""
                    Xin chào %s,

                    Thử thách '%s' mà bạn tham gia đã được cập nhật trạng thái: %s.

                    %s

                    Vui lòng kiểm tra thử thách để nắm rõ thông tin mới nhất.

                    Trân trọng,
                    Đội ngũ GoBeyond
                    """,
                        fullName,
                        challengeName,
                        status,
                        (note != null ? "Ghi chú từ quản trị viên: " + note : "") // ✅ chèn note nếu có
                );

                fixedGmailService.sendEmail(email, subject, body);
            } catch (Exception e) {
                // Ghi log nếu cần
            }
        });
    }

}
