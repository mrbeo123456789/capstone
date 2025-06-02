package org.capstone.backend.repository;

import org.capstone.backend.entity.Evidence;
import org.capstone.backend.entity.EvidenceReport;
import org.capstone.backend.entity.Member;
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



    // Tìm các EvidenceReport chưa review xong cho 1 thử thách, 1 ngày cụ thể
    @Query("""
    SELECT r FROM EvidenceReport r
    WHERE r.evidence.challenge.id = :challengeId
      AND DATE(r.evidence.submittedAt) = :date
      AND r.isApproved IS NULL
""")
    List<EvidenceReport> findUnfinishedReportsByChallengeAndDate(@Param("challengeId") Long challengeId, @Param("date") LocalDate date);

    // Đếm số review đã hoàn thành (isApproved != NULL)
    @Query("""
    SELECT COUNT(r) FROM EvidenceReport r
    WHERE r.evidence.id = :evidenceId
      AND r.isApproved IS NOT NULL
""")
    int countFinishedReportsByEvidence(@Param("evidenceId") Long evidenceId);

    // Đếm số review được approve
    @Query("""
    SELECT COUNT(r) FROM EvidenceReport r
    WHERE r.evidence.id = :evidenceId
      AND r.isApproved = true
""")
    int countApprovedReportsByEvidence(@Param("evidenceId") Long evidenceId);

    // Đếm số review bị reject
    @Query("""
    SELECT COUNT(r) FROM EvidenceReport r
    WHERE r.evidence.id = :evidenceId
      AND r.isApproved = false
""")
    int countRejectedReportsByEvidence(@Param("evidenceId") Long evidenceId);

    // Kiểm tra người nộp có đi review người khác hôm đó không
    @Query("""
    SELECT COUNT(r) > 0 FROM EvidenceReport r
    WHERE r.reviewer.id = :reviewerId
      AND r.evidence.challenge.id = :challengeId
      AND DATE(r.reviewedAt) = :date
""")
    boolean hasReviewedOthersOnDate(@Param("reviewerId") Long reviewerId, @Param("challengeId") Long challengeId, @Param("date") LocalDate date);
    @Query("SELECT COUNT(r) FROM EvidenceReport r WHERE r.reviewer = :reviewer")
    long countByReviewer(@Param("reviewer") Member reviewer);

}
