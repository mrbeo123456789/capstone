package org.capstone.backend.listener;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.event.ChallengeRoleUpdatedEvent;
import org.capstone.backend.service.notification.NotificationService;
import org.capstone.backend.utils.enums.NotificationType;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChallengeRoleUpdatedListener {

    private final NotificationService notificationService;

    @Async("taskExecutor")
    @EventListener
    public void handleChallengeRoleUpdated(ChallengeRoleUpdatedEvent event) {
        String userId = event.member().getMember().getId().toString();
        String challengeName = event.member().getChallenge().getName();
        String newRole = event.newRole().name();

        // Gửi Notification (❌ Không gửi email)
        notificationService.sendNotification(
                userId,
                "Cập nhật vai trò trong thử thách",
                "Vai trò của bạn trong thử thách '" + challengeName + "' đã thay đổi thành: " + newRole,
                NotificationType.ROLE_UPDATE
        );
    }
}
