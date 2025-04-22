package org.capstone.backend.repository;

import org.capstone.backend.dto.rank.GlobalGroupRankingDto;
import org.capstone.backend.entity.GlobalGroupRanking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GlobalGroupRankingRepository extends JpaRepository<GlobalGroupRanking, Long> {

    @Query(value = """
    SELECT 
        cm.group_id AS groupId,
        g.group_name AS groupName,
        g.picture AS groupPicture,
        SUM(group_avg_star) AS totalStars
    FROM (
        SELECT 
            cm.group_id,
            cm.challenge_id,
            AVG(csr.average_star) AS group_avg_star
        FROM challenge_member cm
        JOIN challenge c ON cm.challenge_id = c.challenge_id
        JOIN challenge_star_rating csr 
            ON csr.member_id = cm.member_id AND csr.challenge_id = cm.challenge_id
        WHERE cm.group_id IS NOT NULL
          AND cm.is_participate = true
          AND c.participation_type = 'GROUP'
        GROUP BY cm.group_id, cm.challenge_id
    ) AS challenge_group_score
    JOIN `groups` g ON g.group_id = challenge_group_score.group_id
    GROUP BY challenge_group_score.group_id, g.group_name, g.picture
    ORDER BY totalStars DESC
    """, nativeQuery = true)
    List<GlobalGroupRankingDto> calculateGlobalGroupRanking();


    Page<GlobalGroupRanking> findByGroupNameContainingIgnoreCaseOrderByTotalStarsDesc(String keyword, Pageable pageable);

    // Dành cho hiển thị tất cả nếu không tìm kiếm
    Page<GlobalGroupRanking> findAllByOrderByTotalStarsDesc(Pageable pageable);
}
