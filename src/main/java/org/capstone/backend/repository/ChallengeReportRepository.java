package org.capstone.backend.repository;

import org.capstone.backend.dto.report.ChallengeReportResponseDTO;
import org.capstone.backend.entity.ChallengeReport;
import org.capstone.backend.utils.enums.ReportStatus;
import org.capstone.backend.utils.enums.ReportType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeReportRepository extends JpaRepository<ChallengeReport, Long> {
    List<ChallengeReport> findByChallengeId(Long challengeId);
    @Query("""
    SELECT new org.capstone.backend.dto.report.ChallengeReportResponseDTO(
        r.id,
        r.challenge.name,
        r.reporter.fullName,
        r.reportType,
        r.content,
        r.status,
        r.createdAt
    )
    FROM ChallengeReport r
    WHERE (:reportType IS NULL OR r.reportType = :reportType)
    ORDER BY 
        CASE WHEN r.status = 'PENDING' THEN 0
             WHEN r.status = 'REJECTED' THEN 1
             ELSE 2
        END,
        r.createdAt DESC
""")
    Page<ChallengeReportResponseDTO> filterReportsForAdmin(
            @Param("reportType") ReportType reportType,
            Pageable pageable);
    Long countByStatus(ReportStatus status);

}
