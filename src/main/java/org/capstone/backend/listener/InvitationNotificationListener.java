package org.capstone.backend.listener;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.event.InvitationSentEvent;
import org.capstone.backend.service.notification.NotificationService;
import org.capstone.backend.utils.enums.NotificationType;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InvitationNotificationListener {

    private final NotificationService notificationService;

    @Async
    @EventListener
    public void handleInvitationSent(InvitationSentEvent event) {
        notificationService.sendNotification(
                event.targetUserId(),
                event.title(),
                event.content(),
                NotificationType.INVITATION  // 🔥 Luôn là INVITATION
        );
    }
}
