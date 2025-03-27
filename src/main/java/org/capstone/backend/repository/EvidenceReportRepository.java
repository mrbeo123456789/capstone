package org.capstone.backend.repository;

import org.capstone.backend.entity.EvidenceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvidenceReportRepository extends JpaRepository<EvidenceReport, Long> {
    int countByReviewerId(Long reviewerId);

}
