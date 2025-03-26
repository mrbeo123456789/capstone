package org.capstone.backend.dto.group;

import lombok.Data;

@Data
public class GroupInvitationDTO {
    private Long groupId;
    private String groupName;
    private String invitedBy; // Người gửi lời mời
}
