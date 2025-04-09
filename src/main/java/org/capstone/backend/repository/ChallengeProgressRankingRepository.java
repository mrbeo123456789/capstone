package org.capstone.backend.repository;

import org.capstone.backend.entity.ChallengeProgressRanking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeProgressRankingRepository extends JpaRepository<ChallengeProgressRanking, Long> {

    @Modifying
    @Query("DELETE FROM ChallengeProgressRanking c WHERE c.id.challengeId = :challengeId")
    void deleteByChallengeId(@Param("challengeId") Long challengeId);


    List<ChallengeProgressRanking> findTop3ById_ChallengeIdOrderByScoreDesc(Long challengeId);

}
