package org.capstone.backend.repository;

import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.Evidence;
import org.capstone.backend.entity.Member;
import org.capstone.backend.utils.enums.EvidenceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long> {
    @Query("""
    SELECT e FROM Evidence e
    WHERE e.challenge.id = :challengeId
    AND NOT EXISTS (
        SELECT r FROM EvidenceReport r
        WHERE r.evidence = e
    )
    ORDER BY e.submittedAt ASC
""")
    List<Evidence> findAllUnassignedEvidenceByChallengeOrderBySubmittedAtAsc(@Param("challengeId") Long challengeId);

    @Query("SELECT COUNT(e) FROM Evidence e WHERE e.member.id = :memberId AND e.challenge.id = :challengeId")
    long countTotalEvidence(@Param("memberId") Long memberId, @Param("challengeId") Long challengeId);

    @Query("SELECT COUNT(e) FROM Evidence e WHERE e.member.id = :memberId AND e.challenge.id = :challengeId AND e.status = :status")
    long countApprovedEvidence(@Param("memberId") Long memberId,
                               @Param("challengeId") Long challengeId,
                               @Param("status") EvidenceStatus status);
    // EvidenceRepository.java
    List<Evidence> findByMemberIdAndChallengeIdOrderBySubmittedAtAsc(Long memberId, Long challengeId);
    List<Evidence> findByChallengeIdAndStatus(Long challengeId, EvidenceStatus status);

    @Query("SELECT e FROM Evidence e " +
            "WHERE e.member.id = :memberId " +
            "AND e.challenge.id = :challengeId " +
            "AND e.submittedAt BETWEEN :start AND :end " +
            "ORDER BY e.submittedAt ASC")
    List<Evidence> findTodayEvidence(
            @Param("memberId") Long memberId,
            @Param("challengeId") Long challengeId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);


    @Query("SELECT e FROM Evidence e WHERE e.member.id = :memberId AND e.challenge.id = :challengeId ORDER BY e.submittedAt DESC")
    Page<Evidence> findByMemberIdAndChallengeId(@Param("memberId") Long memberId,
                                                @Param("challengeId") Long challengeId,
                                                Pageable pageable);

    @Query("""
SELECT e FROM Evidence e
WHERE e.challenge.id = :challengeId
AND (
    (e.submittedAt < :today)
    OR
    (e.submittedAt >= :endDateStart AND e.submittedAt <= :endDateEnd)
)
""")
    Page<Evidence> findAllowedEvidenceForHost(
            @Param("challengeId") Long challengeId,
            @Param("today") LocalDateTime today,
            @Param("endDateStart") LocalDateTime endDateStart,
            @Param("endDateEnd") LocalDateTime endDateEnd,
            Pageable pageable
    );

    @Query("SELECT e FROM Evidence e WHERE e.member.id = :memberId AND e.challenge.id = :challengeId")
    Optional<Evidence> findEvidenceByMemberAndChallenge(Long memberId, Long challengeId);
}


