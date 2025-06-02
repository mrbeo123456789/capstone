package org.capstone.backend.repository;

import org.capstone.backend.dto.rank.GroupProgressRankingDTO;
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
    @Query(value = "SELECT \n" +
            "    cm.challenge_id AS challengeId,\n" +
            "    cm.group_id AS groupId,\n" +
            "    g.group_name AS groupName,\n" +
            "    g.picture AS groupPicture,\n" +                      // ✅ thêm dòng này
            "    AVG(cpr.score) AS averageScore,\n" +
            "    COUNT(*) AS memberCount\n" +
            "FROM challenge_progress_ranking cpr\n" +
            "JOIN challenge_member cm \n" +
            "    ON cpr.challenge_id = cm.challenge_id AND cpr.member_id = cm.member_id\n" +
            "JOIN `groups` g ON cm.group_id = g.group_id\n" +
            "WHERE cm.group_id IS NOT NULL\n" +
            "  AND cm.status = 'JOINED'\n" +
            "  AND cm.is_participate = true\n" +
            "  AND cm.challenge_id = :challengeId\n" +
            "GROUP BY cm.challenge_id, cm.group_id, g.group_name, g.picture\n" +  // ✅ cập nhật group by
            "ORDER BY averageScore DESC\n" +
            "LIMIT 3",
            nativeQuery = true)
    List<GroupProgressRankingDTO> getTop3GroupProgressByChallenge(@Param("challengeId") Long challengeId);


    List<ChallengeProgressRanking> findTop3ById_ChallengeIdOrderByScoreDesc(Long challengeId);

}
