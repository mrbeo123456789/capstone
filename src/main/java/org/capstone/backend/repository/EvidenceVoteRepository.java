package org.capstone.backend.repository;

import org.capstone.backend.entity.EvidenceVote;
import org.capstone.backend.entity.Evidence;
import org.capstone.backend.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EvidenceVoteRepository extends JpaRepository<EvidenceVote, Long> {
    boolean existsByEvidenceIdAndVoterId(Long evidenceId, Long voterId);

    @Query("SELECT COUNT(ev) FROM EvidenceVote ev WHERE ev.voter.id = :voterId")
    int countByVoterId(@Param("voterId") Long voterId);


}
