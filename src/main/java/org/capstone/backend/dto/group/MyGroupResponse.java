package org.capstone.backend.dto.group;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.capstone.backend.utils.enums.GroupMemberStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MyGroupResponse {
    private Long groupId;
    private String name;
    private String picture;
    private String memberRole;
    private int totalMembers;
}
