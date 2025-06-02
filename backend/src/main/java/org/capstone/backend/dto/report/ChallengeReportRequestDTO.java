package org.capstone.backend.dto.report;

import lombok.Data;
import org.capstone.backend.utils.enums.ReportType;

@Data
public class ChallengeReportRequestDTO {
    private Long challengeId;
    private ReportType reportType;
    private String content;
}
