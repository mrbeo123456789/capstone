package org.capstone.backend.repository;

import org.capstone.backend.entity.Evidence;
import org.capstone.backend.entity.EvidenceReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvidenceReportRepository extends JpaRepository<EvidenceReport, Long> {
    int countByReviewerId(Long reviewerId);
    Optional<EvidenceReport> findByEvidenceId(long id);
    List<EvidenceReport> findByReviewerIdAndIsApprovedIsNull(Long reviewerId);


}
