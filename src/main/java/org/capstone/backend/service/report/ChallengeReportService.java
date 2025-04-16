package org.capstone.backend.service.report;


import org.capstone.backend.dto.report.ChallengeReportRequestDTO;
import org.capstone.backend.dto.report.ChallengeReportResponseDTO;
import org.capstone.backend.utils.enums.ReportStatus;
import org.capstone.backend.utils.enums.ReportType;
import org.springframework.data.domain.Page;

public interface ChallengeReportService {
    void reportChallenge( ChallengeReportRequestDTO dto);
    Page<ChallengeReportResponseDTO> filterReports(String type, int page, int size);
    void updateReportStatus(Long reportId, ReportStatus newStatus);

}
