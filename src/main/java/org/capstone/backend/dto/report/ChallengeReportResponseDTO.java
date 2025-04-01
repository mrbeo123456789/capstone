package org.capstone.backend.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.capstone.backend.utils.enums.ReportStatus;
import org.capstone.backend.utils.enums.ReportType;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ChallengeReportResponseDTO {
    private Long id;
    private String challengeName;
    private String reporterName;
    private ReportType reportType;
    private String content;
    private ReportStatus status;
    private LocalDateTime createdAt;
}
