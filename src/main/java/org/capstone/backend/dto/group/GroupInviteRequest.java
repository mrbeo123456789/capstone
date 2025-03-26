package org.capstone.backend.dto.group;

import lombok.Data;
import java.util.List;

@Data
public class GroupInviteRequest {
    private Long groupId;
    private List<Long> memberIds; // Danh sách ID của thành viên được mời
}
