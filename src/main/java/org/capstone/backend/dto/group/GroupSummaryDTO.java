package org.capstone.backend.dto.group;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class GroupSummaryDTO {
    private Long id;
    private String name;
    private int memberCount;
    private LocalDateTime createdAt;
    private String picture;
}
