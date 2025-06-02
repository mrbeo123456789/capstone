package org.capstone.backend.dto.evidence;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.capstone.backend.utils.enums.EvidenceStatus;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EvidenceToReviewDTO {
    private Long evidenceId;
    private Long memberId;
    private String memberName;
    private String evidenceUrl;
    private EvidenceStatus status;
    private boolean canEdit;
    private LocalDateTime submittedAt;
}
