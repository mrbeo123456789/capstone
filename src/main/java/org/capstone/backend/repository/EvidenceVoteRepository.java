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

    @Query("""
        SELECT AVG(ev.score)
        FROM EvidenceVote ev
        JOIN ev.evidence e
        WHERE ev.voter.id = :memberId
          AND e.challenge.id = :challengeId
    """)
    Double getAverageScoreByMemberInChallenge(Long memberId, Long challengeId);

    // Tính tổng sao và số lượng vote mỗi người đã nhận trong challenge
    @Query("SELECT ev.evidence.member.id, SUM(ev.score), COUNT(ev.id) " +
            "FROM EvidenceVote ev " +
            "WHERE ev.evidence.challenge.id = :challengeId " +
            "GROUP BY ev.evidence.member.id")
    List<Object[]> calculateReceivedRatingStats(@Param("challengeId") Long challengeId);

    // Số lượt vote người này đã chấm cho người khác trong thử thách
    @Query("SELECT COUNT(ev) FROM EvidenceVote ev " +
            "WHERE ev.voter.id = :memberId AND ev.evidence.challenge.id = :challengeId")
    int countVotesGivenByMemberInChallenge(@Param("memberId") Long memberId,
                                           @Param("challengeId") Long challengeId);

}
