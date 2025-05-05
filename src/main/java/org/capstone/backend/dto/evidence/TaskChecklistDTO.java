package org.capstone.backend.dto.evidence;

import lombok.Data;
import lombok.Setter;

@Data
public class TaskChecklistDTO {
    private Long challengeId;
    private String challengeName;

    private String evidenceStatus;

    private Integer totalReviewAssigned;
    private Integer reviewCompleted;
}

