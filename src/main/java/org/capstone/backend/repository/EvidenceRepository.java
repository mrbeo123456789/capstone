package org.capstone.backend.repository;

import org.capstone.backend.dto.evidence.EvidenceStatusCountDTO;
import org.capstone.backend.entity.Evidence;
import org.capstone.backend.entity.Member;
import org.capstone.backend.utils.enums.EvidenceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    long countByMember(Member member);


    @Query("""
    SELECT e FROM Evidence e
    WHERE e.challenge.id = :challengeId
    AND e.member.id = :memberId
    AND (:status IS NULL OR e.status = :status)
    ORDER BY\s
        CASE\s
            WHEN e.status = 'PENDING' THEN 0
            WHEN e.status = 'REJECTED' THEN 1
            WHEN e.status = 'APPROVED' THEN 2
            ELSE 3
        END,
        e.submittedAt DESC
""")
    Page<Evidence> findAllowedEvidenceForHostByMemberIdAndStatus(
            @Param("challengeId") Long challengeId,
            @Param("memberId") Long memberId,
            @Param("today") LocalDateTime today,
            @Param("endDateStart") LocalDateTime endDateStart,
            @Param("endDateEnd") LocalDateTime endDateEnd,
            @Param("status") EvidenceStatus status,
            Pageable pageable
    );


    @Query("SELECT e FROM Evidence e " +
            "WHERE e.member.id = :memberId " +
            "AND e.challenge.id = :challengeId " +
            "AND DATE(e.submittedAt) = :date")
    Optional<Evidence> findByMemberIdAndChallengeIdAndDate(
            @Param("memberId") Long memberId,
            @Param("challengeId") Long challengeId,
            @Param("date") LocalDate date);


    @Query("""
        SELECT new org.capstone.backend.dto.evidence.EvidenceStatusCountDTO(
                e.status, 
                COUNT(e)
        )
        FROM Evidence e
        WHERE e.challenge.id = :challengeId
          AND e.member.id = :memberId
        GROUP BY e.status
    """)
    List<EvidenceStatusCountDTO> countEvidenceByStatusForHost(
            @Param("challengeId") Long challengeId,
            @Param("memberId") Long memberId
    );

    @Query("SELECT COUNT(e) FROM Evidence e WHERE e.challenge.id = :challengeId")
    int countAllEvidence(@Param("challengeId") Long challengeId);

    @Query("SELECT COUNT(e) FROM Evidence e WHERE e.challenge.id = :challengeId AND e.status = 'APPROVED'")
    int countApprovedEvidence(@Param("challengeId") Long challengeId);

    @Query("SELECT COUNT(e) FROM Evidence e WHERE e.challenge.id = :challengeId AND e.status = 'PENDING'")
    int countPendingEvidence(@Param("challengeId") Long challengeId);

    @Query("SELECT COUNT(e) FROM Evidence e WHERE e.challenge.id = :challengeId AND e.status = 'REJECTED'")
    int countRejectedEvidence(@Param("challengeId") Long challengeId);

    @Query("SELECT COUNT(e) FROM Evidence e WHERE e.challenge.id = :challengeId AND DATE(e.submittedAt) = CURRENT_DATE")
    int countEvidenceToday(@Param("challengeId") Long challengeId);

    @Query("""
    SELECT e FROM Evidence e
    WHERE e.challenge.id = :challengeId
      AND e.status = 'PENDING'
    ORDER BY e.submittedAt ASC
""")
    List<Evidence> findPendingEvidenceByChallengeOrderBySubmittedAtAsc(@Param("challengeId") Long challengeId);
    boolean existsByMemberAndSubmittedAtBetween(Member member, LocalDateTime start, LocalDateTime end);


}


