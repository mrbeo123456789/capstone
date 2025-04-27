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

    int countByEvidenceId(Long evidenceId);

    int countByEvidenceIdAndIsApproved(Long evidenceId, boolean isApproved);

    Optional<EvidenceReport> findByEvidenceIdAndReviewerId(Long evidenceId, Long reviewerId);

    @Query("""
    SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
    FROM EvidenceReport r
    WHERE r.evidence.id = :evidenceId
      AND r.reviewer IS NULL
""")
    boolean existsByEvidenceIdAndReviewerIsNull(@Param("evidenceId") Long evidenceId);

    @Query("""
    SELECT r FROM EvidenceReport r
    WHERE r.evidence.challenge.id = :challengeId
      AND r.reviewer IS NULL
""")
    List<EvidenceReport> findByChallengeIdAndReviewerIsNull(@Param("challengeId") Long challengeId);

    @Query("""
    SELECT r FROM EvidenceReport r
    WHERE r.evidence.challenge.id = :challengeId
      AND r.reviewer IS NULL
      AND r.isApproved IS NULL
""")
    List<EvidenceReport> findUnassignedReportsByChallenge(@Param("challengeId") Long challengeId);

    @Query("""
    SELECT r FROM EvidenceReport r
    WHERE r.evidence.id = :evidenceId
      AND r.reviewer IS NULL
    ORDER BY r.createdAt ASC
    LIMIT 1
""")
    Optional<EvidenceReport> findFirstByEvidenceIdAndReviewerIdIsNull(@Param("evidenceId") Long evidenceId);

    @Query("""
    SELECT DISTINCT r.evidence.id FROM EvidenceReport r
    WHERE r.reviewer.id = :reviewerId
""")
    List<Long> findEvidenceIdsReviewedByMember(@Param("reviewerId") Long reviewerId);

}
