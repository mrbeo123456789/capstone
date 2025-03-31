package org.capstone.backend.repository;

import org.capstone.backend.entity.EvidenceVote;
import org.capstone.backend.entity.Evidence;
import org.capstone.backend.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EvidenceVoteRepository extends JpaRepository<EvidenceVote, Long> {
    boolean existsByEvidenceAndVoter(Evidence evidence, Member voter);

    Optional<EvidenceVote> findByEvidenceAndVoter(Evidence evidence, Member voter);

    List<EvidenceVote> findAllByEvidence(Evidence evidence);
}
