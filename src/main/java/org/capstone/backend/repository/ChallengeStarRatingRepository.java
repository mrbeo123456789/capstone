package org.capstone.backend.repository;

import org.capstone.backend.dto.rank.GroupStarRatingProjection;
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

    @Query(value = """
    SELECT
        g.group_id AS groupId,
        g.group_name AS groupName,
        g.picture AS picture,
        ROUND(COALESCE(AVG(csr.average_star), 0), 1) AS averageStar,
        COUNT(DISTINCT cm.member_id) AS memberCount
    FROM challenge_member cm
    JOIN `groups` g ON cm.group_id = g.group_id
    LEFT JOIN challenge_star_rating csr 
        ON cm.member_id = csr.member_id AND cm.challenge_id = csr.challenge_id
    WHERE cm.challenge_id = :challengeId
      AND cm.group_id IS NOT NULL
      AND cm.status = 'JOINED'
    GROUP BY g.group_id, g.group_name, g.picture
    ORDER BY ROUND(COALESCE(AVG(csr.average_star), 0), 1) DESC, g.group_name ASC
    """,
            countQuery = """
    SELECT COUNT(*) FROM (
        SELECT cm.group_id
        FROM challenge_member cm
        WHERE cm.challenge_id = :challengeId
          AND cm.group_id IS NOT NULL
          AND cm.status = 'JOINED'
        GROUP BY cm.group_id
    ) AS grouped
    """,
            nativeQuery = true)
    Page<GroupStarRatingProjection> getGroupStarRatingsByChallengeIdNative(@Param("challengeId") Long challengeId, Pageable pageable);


}
