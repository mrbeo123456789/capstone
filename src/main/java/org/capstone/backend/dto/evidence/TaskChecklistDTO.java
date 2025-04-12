package org.capstone.backend.dto.evidence;

import lombok.Data;
import lombok.Setter;

@Data
public class TaskChecklistDTO {

    private Long challengeId;
    private String challengeName;
    private boolean isEvidenceSubmitted;
    private String evidenceStatus;
    private boolean isEvidenceApproved;
    private String message;

}
