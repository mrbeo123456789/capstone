package org.capstone.backend.dto.group;

import lombok.Data;

@Data
public class MemberSearchRequest {
    private String keyword; // Từ khóa tìm kiếm (email hoặc họ tên)
    private Long groupId;   // ID của nhóm (có thể null nếu không cần lọc)
}
