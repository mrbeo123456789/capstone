package org.capstone.backend.repository;

import org.capstone.backend.entity.ChallengeProgressRanking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeProgressRankingRepository extends JpaRepository<ChallengeProgressRanking, Long> {

    void deleteByChallengeId(Long challengeId);

    Page<ChallengeProgressRanking> findByChallengeId(Long challengeId, Pageable pageable);

}
