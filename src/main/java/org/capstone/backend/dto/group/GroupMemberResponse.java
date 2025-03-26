package org.capstone.backend.dto.group;

import lombok.Data;
import org.capstone.backend.utils.enums.GroupMemberStatus;

import java.time.LocalDateTime;

@Data
public class GroupMemberResponse {
    private Long id;
    private Long memberId; // 🔥 Only return the ID instead of the whole Member entity
    private String role;
    private GroupMemberStatus status;
    private String imageUrl;
    private LocalDateTime joinDate;
    private String memberName;
}
