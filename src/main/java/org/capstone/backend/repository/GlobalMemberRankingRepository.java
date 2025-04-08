package org.capstone.backend.repository;

import org.capstone.backend.dto.rank.GlobalRankingDto;
import org.capstone.backend.entity.GlobalMemberRanking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GlobalMemberRankingRepository extends JpaRepository<GlobalMemberRanking, Long> {
    @Query("""
        SELECT new org.capstone.backend.dto.rank.GlobalRankingDto(
            m.id,
            m.fullName,
            SUM(csr.totalStar)
        )
        FROM ChallengeStarRating csr
        JOIN Challenge c ON csr.challengeId = c.id
        JOIN Member m ON csr.memberId = m.id
        WHERE c.status <> 'BANNED'
        GROUP BY m.id, m.fullName
        ORDER BY SUM(csr.totalStar) DESC
        """)
    List<GlobalRankingDto> calculateGlobalRanking();

    Page<GlobalMemberRanking> findAllByOrderByTotalStarsDesc(Pageable pageable);
}
