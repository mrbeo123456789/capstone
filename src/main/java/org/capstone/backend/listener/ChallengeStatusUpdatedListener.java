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

        // Tách status và adminNote
        String[] parts = statusMessage.split(" - ", 2);
        String status = parts[0];
        String note = (parts.length > 1 && !parts[1].isBlank()) ? parts[1] : null;

        // Tiêu đề dùng key i18n
        String titleKey = "notification.challengeStatusUpdated.title";

        // Duyệt tất cả người tham gia
        challengeMemberRepository.findByChallenge(challenge).forEach(member -> {
            String userId = member.getMember().getId().toString();
            String fullName = member.getMember().getFullName();
            String email = member.getMember().getAccount().getEmail();

            // ✅ Format content trực tiếp tại backend
            Map<String, String> data = new HashMap<>();
            data.put("challengeName", challengeName);
            data.put("status", status);
            data.put("hasNote", note != null ? "true" : "false");
            data.put("adminNote", note != null ? note : "");

            notificationService.sendNotification(
                    userId,
                    "notification.challengeStatusUpdated.title",
                    "notification.challengeStatusUpdated.content",
                    NotificationType.SYSTEM_ANNOUNCEMENT,
                    data
            );

            // Gửi Email
            try {
                String subject = "Cập nhật trạng thái thử thách '" + challengeName + "'";
                StringBuilder body = new StringBuilder();
                body.append("Xin chào ").append(fullName).append(",\n\n")
                        .append("Thử thách '").append(challengeName)
                        .append("' mà bạn tham gia đã được cập nhật trạng thái: ").append(status).append(".\n\n");

                if (note != null) {
                    body.append("Ghi chú từ quản trị viên: ").append(note).append("\n\n");
                }

                body.append("Vui lòng kiểm tra thử thách để nắm rõ thông tin mới nhất.\n\n")
                        .append("Trân trọng,\nĐội ngũ GoBeyond");

                fixedGmailService.sendEmail(email, subject, body.toString());
            } catch (Exception e) {
                e.printStackTrace(); // hoặc log lỗi nếu cần
            }
        });
    }


}
