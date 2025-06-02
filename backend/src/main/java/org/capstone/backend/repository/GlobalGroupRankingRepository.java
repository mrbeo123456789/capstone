package org.capstone.backend.repository;

import org.capstone.backend.dto.rank.GlobalGroupRankingDto;
import org.capstone.backend.entity.GlobalGroupRanking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GlobalGroupRankingRepository extends JpaRepository<GlobalGroupRanking, Long> {

    @Query(value = """

            SELECT 
        g.group_id AS groupId,
        g.group_name AS groupName,
        g.picture AS groupPicture,
        SUM(COALESCE(cgs.group_avg_star, 0)) AS totalStars
            FROM `groups` g
            LEFT JOIN (
        SELECT
            cm.group_id,
            cm.challenge_id,
            AVG(csr.average_star) AS group_avg_star
        FROM challenge_member cm
        JOIN challenge c ON cm.challenge_id = c.challenge_id
        LEFT JOIN challenge_star_rating csr
            ON csr.member_id = cm.member_id AND csr.challenge_id = cm.challenge_id
        WHERE cm.group_id IS NOT NULL
          AND cm.is_participate = true
          AND c.participation_type = 'GROUP'
         AND c.privacy = 'PUBLIC'
        GROUP BY cm.group_id, cm.challenge_id
            ) AS cgs ON g.group_id = cgs.group_id
            GROUP BY g.group_id, g.group_name, g.picture
            ORDER BY totalStars DESC
    """, nativeQuery = true)
    List<GlobalGroupRankingDto> calculateGlobalGroupRanking();


    // 1. Lấy toàn bộ ranking kèm ảnh (không lọc keyword)
    @Query(value = """
    SELECT 
        ggr.group_id AS groupId,
        ggr.group_name AS groupName,
        g.picture AS groupPicture,
        ggr.total_stars AS totalStars,
        COUNT(DISTINCT gm.member_id) AS memberCount
    FROM global_group_ranking ggr
    JOIN `groups` g ON g.group_id = ggr.group_id
    LEFT JOIN group_members gm 
        ON gm.group_id = ggr.group_id AND gm.status = 'ACTIVE'
    GROUP BY ggr.group_id, ggr.group_name, g.picture, ggr.total_stars
    ORDER BY ggr.total_stars DESC
    """,
            countQuery = "SELECT COUNT(*) FROM global_group_ranking",
            nativeQuery = true)
    Page<GlobalGroupRankingDto> findAllWithPicture(Pageable pageable);

    @Query(value = """
    SELECT 
        ggr.group_id AS groupId,
        ggr.group_name AS groupName,
        g.picture AS groupPicture,
        ggr.total_stars AS totalStars,
        COUNT(DISTINCT gm.member_id) AS memberCount
    FROM global_group_ranking ggr
    JOIN `groups` g ON g.group_id = ggr.group_id
    LEFT JOIN group_members gm 
        ON gm.group_id = ggr.group_id AND gm.status = 'ACTIVE'
    WHERE LOWER(ggr.group_name) LIKE LOWER(CONCAT('%', :keyword, '%'))
    GROUP BY ggr.group_id, ggr.group_name, g.picture, ggr.total_stars
    ORDER BY ggr.total_stars DESC
    """,
            countQuery = """
        SELECT COUNT(*) 
        FROM global_group_ranking ggr
        JOIN `groups` g ON g.group_id = ggr.group_id
        WHERE LOWER(ggr.group_name) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """,
            nativeQuery = true)
    Page<GlobalGroupRankingDto> searchByGroupNameWithPicture(@Param("keyword") String keyword, Pageable pageable);

}