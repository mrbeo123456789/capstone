// NotificationController.java
package org.capstone.backend.controller.notification;

import org.capstone.backend.service.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/member/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String lastCreatedAt
    ) throws Exception {
        List<Map<String, Object>> notifications = notificationService.getNotifications( limit, lastCreatedAt);
        return ResponseEntity.ok(notifications);
    }
}
