package org.capstone.backend.service.notification;

import org.capstone.backend.utils.enums.NotificationType;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public interface NotificationService {
    void sendNotification(String userId, String title, String content, NotificationType type);
    List<Map<String, Object>> getNotifications( int limit, String lastCreatedAtStr) throws ExecutionException, InterruptedException;
}
