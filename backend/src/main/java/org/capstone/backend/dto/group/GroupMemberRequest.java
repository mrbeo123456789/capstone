package org.capstone.backend.dto.group;

import lombok.Data;
import org.capstone.backend.utils.enums.GroupMemberStatus;

@Data
public class GroupMemberRequest {
    private Long groupId; // ID của nhóm
    private GroupMemberStatus status; // Trạng thái lời mời (PENDING, ACCEPTED, REJECTED)
}
