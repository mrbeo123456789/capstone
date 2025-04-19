package org.capstone.backend.listener;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.event.ChallengeRoleUpdatedEvent;
import org.capstone.backend.service.notification.NotificationService;
import org.capstone.backend.utils.enums.NotificationType;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

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

        Map<String, String> data = new HashMap<>();
        data.put("challengeName", challengeName);
        data.put("role", newRole);

        // Gửi Notification (❌ Không gửi email)
        notificationService.sendNotification(
                userId,
                "notification.challengeRoleUpdated.title",
                "notification.challengeRoleUpdated.content",
                NotificationType.ROLE_UPDATE,
                data

        );
    }
}