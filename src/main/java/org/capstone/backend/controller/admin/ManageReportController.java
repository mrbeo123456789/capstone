package org.capstone.backend.controller.admin;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.report.ChallengeReportResponseDTO;
import org.capstone.backend.service.report.ChallengeReportService;
import org.capstone.backend.utils.enums.ReportStatus;
import org.capstone.backend.utils.enums.ReportType;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class ManageReportController {

    private final ChallengeReportService challengeReportService;

    @GetMapping("/all")
    public Page<ChallengeReportResponseDTO> filterReports(
            @RequestParam(required = false) String reportType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return challengeReportService.filterReports(reportType, page, size);
    }


    @PutMapping("/{reportId}")
    public ResponseEntity<?> updateReportStatus(
            @PathVariable Long reportId,
            @RequestParam String status
    ) {
        challengeReportService.updateReportStatus(reportId, ReportStatus.valueOf(status));
        return ResponseEntity.ok("Report status updated.");
    }
}
