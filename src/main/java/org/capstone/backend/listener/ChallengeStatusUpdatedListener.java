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

        // Xử lý status và admin note
        String status;
        String note;
        System.out.println(statusMessage);
        String[] parts = statusMessage.split(" - ", 2);
        status = parts[0];
        if (parts.length > 1 && !parts[1].isBlank()) {
            note = parts[1];
        } else {
            note = null;
        }
        statusMessage = status; // ✅ Reset lại để không còn " - note" trong message gốc


        challengeMemberRepository.findByChallenge(challenge).forEach(member -> {
            String userId = member.getMember().getId().toString();
            String fullName = member.getMember().getFullName();
            String email = member.getMember().getAccount().getEmail();

            // Dữ liệu cho notification (i18n)
            Map<String, String> data = new HashMap<>();
            data.put("challengeName", challengeName);
            data.put("status", status);
            if (note != null) { // chỉ thêm nếu thực sự có ghi chú
                data.put("adminNote", note);
            }


            // 1. Gửi Notification (FE i18n sẽ xử lý)
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
                // Ghi log nếu cần
                e.printStackTrace();
            }
        });
    }
}
