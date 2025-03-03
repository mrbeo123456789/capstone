package org.capstone.backend.dto.group;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class GroupResponse {
    private Long id;
    private String name;
    private Integer maxParticipants;
    private LocalDateTime createdAt;
    private Long createdBy;
    private LocalDateTime updatedAt;
    private Long updatedBy;
    private List<GroupMemberResponse> members; // 🔥 Include only necessary fields
}
