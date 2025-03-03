package org.capstone.backend.dto.group;

import lombok.Data;

@Data
public class GroupRequest {
    private String name;
    private Integer maxParticipants;
}
