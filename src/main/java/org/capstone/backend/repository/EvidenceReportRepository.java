package org.capstone.backend.repository;

import org.capstone.backend.entity.Evidence;
import org.capstone.backend.entity.EvidenceReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvidenceReportRepository extends JpaRepository<EvidenceReport, Long> {
    int countByReviewerId(Long reviewerId);
    Optional<EvidenceReport> findByEvidenceId(long id);
    List<EvidenceReport> findByReviewerIdAndIsApprovedIsNull(Long reviewerId);
    long countByReviewer_IdAndEvidence_Challenge_Id(Long reviewerId, Long challengeId);
    @Query("""
    SELECT er FROM EvidenceReport er
    WHERE er.reviewer.id = :reviewerId
      AND er.evidence.challenge.id = :challengeId
      AND FUNCTION('DATE', er.createdAt) = :assignedDate
""")
    List<EvidenceReport> findByReviewerIdAndChallengeIdAndAssignedDate(
            @Param("reviewerId") Long reviewerId,
            @Param("challengeId") Long challengeId,
            @Param("assignedDate") LocalDate assignedDate
    );

    @Query("SELECT COUNT(er) FROM EvidenceReport er WHERE er.evidence.challenge.id = :challengeId AND er.isApproved IS NULL")
    int countPendingReviews(@Param("challengeId") Long challengeId);


}
