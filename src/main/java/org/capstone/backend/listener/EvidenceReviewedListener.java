package org.capstone.backend.listener;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.entity.Evidence;
import org.capstone.backend.event.EvidenceReviewedEvent;
import org.capstone.backend.service.notification.NotificationService;
import org.capstone.backend.utils.enums.NotificationType;
import org.capstone.backend.utils.sendmail.FixedGmailService;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
public class EvidenceReviewedListener {

    private final FixedGmailService fixedGmailService;
    private final NotificationService notificationService;

    @Async("taskExecutor")
    @EventListener
    public void handleEvidenceReviewed(EvidenceReviewedEvent event) {
        Evidence evidence = event.evidence();
        String userId = evidence.getMember().getId().toString();
        String challengeName = evidence.getChallenge().getName();
        String day = evidence.getSubmittedAt().toLocalDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String fullName = evidence.getMember().getFullName();
        String email = evidence.getMember().getAccount().getEmail();

        boolean isApproved = event.isApproved();

        // 1. Gửi Notification
        notificationService.sendNotification(
                userId,
                isApproved
                        ? "Bằng chứng ngày " + day + " đã được duyệt"
                        : "Bằng chứng ngày " + day + " bị từ chối",
                isApproved
                        ? "Bằng chứng ngày " + day + " trong thử thách \"" + challengeName + "\" đã được duyệt. Tiếp tục cố gắng nhé!"
                        : "Bằng chứng ngày " + day + " trong thử thách \"" + challengeName + "\" đã bị từ chối. Vui lòng kiểm tra góp ý và nộp lại nếu cần.",
                NotificationType.EVIDENCE_RESULT
        );

        // 2. Gửi Email
        try {
            String subject = "Kết quả bằng chứng ngày " + day + " - " + challengeName;
            String body = String.format("""
                    Xin chào %s,

                    Bằng chứng bạn nộp cho thử thách \"%s\" (Ngày %s) đã được %s.

                    Trạng thái: %s

                    Vui lòng đăng nhập GoBeyond để xem chi tiết và tiếp tục hành trình thử thách!

                    Trân trọng,
                    Đội ngũ GoBeyond
                    """,
                    fullName,
                    challengeName,
                    day,
                    isApproved ? "chấp thuận" : "từ chối",
                    evidence.getStatus()
            );

            fixedGmailService.sendEmail(email, subject, body);
        } catch (Exception e) {
            // Có thể ghi log lỗi tại đây nếu cần
            // logger.error("Failed to send email for EvidenceReviewedListener", e);
        }
    }
}
