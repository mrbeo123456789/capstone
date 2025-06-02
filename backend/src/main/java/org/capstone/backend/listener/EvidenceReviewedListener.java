package org.capstone.backend.listener;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.entity.Evidence;
import org.capstone.backend.entity.EvidenceReport;
import org.capstone.backend.event.EvidenceReviewedEvent;
import org.capstone.backend.service.notification.NotificationService;
import org.capstone.backend.utils.enums.NotificationType;
import org.capstone.backend.utils.sendmail.FixedGmailService;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

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

        // 1. Chuẩn bị placeholders
        Map<String, String> data = new HashMap<>();
        data.put("day", day);
        data.put("challengeName", challengeName);

        EvidenceReport report = evidence.getLatestReport();
        String feedback = report != null ? report.getFeedback() : "(Không có phản hồi)";

        data.put("feedback", feedback == null || feedback.isBlank() ? "(Không có phản hồi)" : feedback);

        // 2. Gửi Notification
        notificationService.sendNotification(
                userId,
                isApproved
                        ? "notification.evidence.approved.title"
                        : "notification.evidence.rejected.title",
                isApproved
                        ? "notification.evidence.approved.content"
                        : "notification.evidence.rejected.content",
                NotificationType.EVIDENCE_RESULT,
                data
        );

        // 3. Gửi Email
        try {
            String subject = "Kết quả bằng chứng ngày " + day + " - " + challengeName;

            String body = String.format("""
                Xin chào %s,

                Bằng chứng bạn nộp cho thử thách "%s" (Ngày %s) đã được %s.

                Trạng thái: %s
                Phản hồi: %s

                Vui lòng đăng nhập GoBeyond để xem chi tiết và tiếp tục hành trình thử thách!

                Trân trọng,
                Đội ngũ GoBeyond
                """,
                    fullName,
                    challengeName,
                    day,
                    isApproved ? "CHẤP THUẬN" : "TỪ CHỐI",
                    evidence.getStatus(),
                    feedback
            );

            fixedGmailService.sendEmail(email, subject, body);
        } catch (Exception e) {
            // Ghi log nếu cần
        }
    }

}
