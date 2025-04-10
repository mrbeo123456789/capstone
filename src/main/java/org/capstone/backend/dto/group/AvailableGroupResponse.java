package org.capstone.backend.dto.group;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AvailableGroupResponse {
    private Long groupId;
    private String groupName;
    private String groupPicture;
}
