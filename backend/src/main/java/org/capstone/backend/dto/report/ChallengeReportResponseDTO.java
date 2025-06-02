package org.capstone.backend.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.capstone.backend.utils.enums.ReportStatus;
import org.capstone.backend.utils.enums.ReportType;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChallengeReportResponseDTO {
    private Long id;
    private Long challengeId;              // ✅ THÊM VÀO ĐÂY
    private String challengeName;
    private String reporterName;
    private ReportType reportType;
    private String content;
    private ReportStatus status;
    private LocalDateTime createdAt;
}
