package org.capstone.backend.listener;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.event.InvitationSentEvent;
import org.capstone.backend.service.notification.NotificationService;
import org.capstone.backend.utils.enums.NotificationType;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class InvitationNotificationListener {

    private final NotificationService notificationService;

    @Async
    @EventListener
    public void handleInvitationSent(InvitationSentEvent event) {
        notificationService.sendNotification(
                event.targetUserId(),
                event.titleKey(),    // 📌 ex: "notification.invite.challenge.title"
                event.contentKey(),
                NotificationType.INVITATION,// 📌 ex: "notification.invite.challenge.content"
                event.params()    // 📌 ex: { challengeName: "Plank 30 Ngày", inviterName: "DuyLV" }

        );
    }
}
