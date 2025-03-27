package org.capstone.backend.dto.group;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MemberSearchResponse {
    private Long id;        // ID thành viên
    private String email;   // Email thành viên
    private String avatar;  // Ảnh đại diện
    private String name;
}
