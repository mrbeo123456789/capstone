package org.capstone.backend.dto.notification;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class NotificationResponse {
    private Long memberId;
    private List<Map<String, Object>> notifications;

    public NotificationResponse(Long memberId, List<Map<String, Object>> notifications) {
        this.memberId = memberId;
        this.notifications = notifications;
    }


}
