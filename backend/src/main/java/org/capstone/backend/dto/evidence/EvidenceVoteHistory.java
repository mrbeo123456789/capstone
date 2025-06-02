package org.capstone.backend.dto.evidence;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceVoteHistory {
    private Long evidenceId;
    private String memberName;       // Tên người nộp bằng chứng
    private LocalDateTime submittedAt;
    private String decision;         // APPROVED, REJECTED
    private String reason;           // Lý do từ chối (nếu có)
    private String evidenceUrl;      // Link hình/video evidence
}
