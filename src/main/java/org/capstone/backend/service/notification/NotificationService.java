package org.capstone.backend.service.notification;

import org.capstone.backend.dto.notification.NotificationResponse;
import org.capstone.backend.utils.enums.NotificationType;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public interface NotificationService {
    void sendNotification(String userId, String titleKey, String contentKey, NotificationType type, Map<String, String> data);
    NotificationResponse getNotifications(int limit, String lastCreatedAtStr) ;
}
