package org.capstone.backend.repository;

import org.capstone.backend.entity.ChallengeStarRating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChallengeStarRatingRepository extends JpaRepository<ChallengeStarRating, Long> {
    Optional<ChallengeStarRating> findByChallengeIdAndMemberId(Long challengeId, Long memberId);
    @Query("SELECT AVG(csr.averageStar) FROM ChallengeStarRating csr WHERE csr.challengeId = :challengeId")
    Double findAverageStarByChallengeId(@Param("challengeId") Long challengeId);



}
