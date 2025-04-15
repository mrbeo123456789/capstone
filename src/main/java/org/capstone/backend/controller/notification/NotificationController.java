package org.capstone.backend.controller.notification;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.notification.NotificationResponse;
import org.capstone.backend.service.notification.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/member/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<NotificationResponse> getNotifications(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String lastCreatedAt
    ) {
        NotificationResponse notifications = notificationService.getNotifications(limit, lastCreatedAt);
        return ResponseEntity.ok(notifications);
    }
}
