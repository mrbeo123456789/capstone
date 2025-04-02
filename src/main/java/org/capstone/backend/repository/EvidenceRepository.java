package org.capstone.backend.repository;

import org.capstone.backend.entity.Evidence;
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
    @Query("SELECT e FROM Evidence e " +
            "WHERE e.challenge.id = :challengeId AND e.status = 'PENDING' AND e.evidenceReport IS NULL " +
            "ORDER BY e.submittedAt ASC")
    List<Evidence> findAllUnassignedEvidenceByChallengeOrderBySubmittedAtAsc(@Param("challengeId") Long challengeId);

    // EvidenceRepository.java
    List<Evidence> findByMemberIdAndChallengeIdOrderBySubmittedAtAsc(Long memberId, Long challengeId);
    List<Evidence> findByChallengeIdAndStatus(Long challengeId, EvidenceStatus status);

    @Query("SELECT e FROM Evidence e WHERE e.member.id = :memberId " +
            "AND e.challenge.id = :challengeId " +
            "AND DATE(e.submittedAt) = :date")
    Optional<Evidence> findTodayEvidence(@Param("memberId") Long memberId,
                                         @Param("challengeId") Long challengeId,
                                         @Param("date") LocalDate date);


    Page<Evidence> findByChallengeId(Long challengeId, Pageable pageable);
}
