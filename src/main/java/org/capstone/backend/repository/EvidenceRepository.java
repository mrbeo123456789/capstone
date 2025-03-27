package org.capstone.backend.repository;

import org.capstone.backend.entity.Evidence;
import org.capstone.backend.utils.enums.EvidenceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long> {
    boolean existsByMemberIdAndChallengeIdAndSubmittedAtBetweenAndStatusIn(
            Long memberId,
            Long challengeId,
            LocalDateTime start,
            LocalDateTime end,
            List<EvidenceStatus> statuses
    );

}
