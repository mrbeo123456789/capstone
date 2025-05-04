package org.capstone.backend.repository;

import org.capstone.backend.dto.member.MemberStatisticDTO;
import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository  extends JpaRepository<Member, Long> {
    Optional<Member> findByAccount(Account account);
    @Query("SELECT m FROM Member m " +
            "WHERE m.account.email LIKE %:keyword% OR m.fullName LIKE %:keyword%")
    Page<Member> searchMembersByKeyword(@Param("keyword") String keyword, Pageable pageable);
    @Query("SELECT COUNT(*) FROM Member WHERE createdAt BETWEEN :start AND :end")
    Long countNewMembersBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    @Query("SELECT DATE(m.createdAt), COUNT(m) FROM Member m WHERE m.createdAt BETWEEN :start AND :end GROUP BY DATE(m.createdAt) ORDER BY DATE(m.createdAt)")
    List<Object[]> countNewMembersGroupedByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = """
    SELECT
        m.id AS memberId,
        m.full_name AS fullName,
        m.avatar AS avatar,
        m.created_at AS createdAt,

        (SELECT COUNT(*) FROM challenge_member cm WHERE cm.member_id = m.id AND cm.status = 'JOINED') AS totalChallengesJoined,
        (SELECT COUNT(*) FROM challenge_member cm WHERE cm.member_id = m.id AND cm.is_completed = true) AS totalChallengesCompleted,
        (SELECT COUNT(*) FROM challenge_member cm WHERE cm.member_id = m.id AND cm.role = 'HOST') AS totalHostedChallenges,

        (SELECT COUNT(*) FROM evidence e WHERE e.member_id = m.id) AS totalEvidenceSubmitted,
        (SELECT COUNT(*) FROM evidence e WHERE e.member_id = m.id AND e.status = 'APPROVED') AS totalApprovedEvidence,
        (SELECT COUNT(*) FROM evidence e WHERE e.member_id = m.id AND e.status = 'REJECTED') AS totalRejectedEvidence,

        (SELECT COUNT(*) FROM evidence_vote ev WHERE ev.voter_id = m.id) AS totalVotesGiven,
        (SELECT COUNT(*) FROM evidence_vote ev JOIN evidence e ON ev.evidence_id = e.id WHERE e.member_id = m.id) AS totalVotesReceived,

        (SELECT COUNT(*) FROM user_achievement ua WHERE ua.member_id = m.id) AS totalAchievements,

        (SELECT gmr.total_stars FROM global_member_ranking gmr WHERE gmr.member_id = m.id) AS totalStars,

        (SELECT cpr.approved_evidence_count FROM challenge_progress_ranking cpr WHERE cpr.member_id = m.id ORDER BY challenge_id LIMIT 1) AS approvedEvidenceCount,
        (SELECT cpr.completed_days FROM challenge_progress_ranking cpr WHERE cpr.member_id = m.id ORDER BY challenge_id LIMIT 1) AS completedDays,
        (SELECT cpr.vote_given_count FROM challenge_progress_ranking cpr WHERE cpr.member_id = m.id ORDER BY challenge_id LIMIT 1) AS voteGivenCount,

        (SELECT COUNT(*) FROM group_members gm WHERE gm.member_id = m.id AND gm.status IN ('ACTIVE', 'ACCEPTED')) AS totalGroupsJoined,
        (SELECT COUNT(*) FROM `groups` g WHERE g.created_by = a.id) AS totalGroupsLed

    FROM member m
    JOIN account a ON m.account_id = a.id
    WHERE m.id = :memberId
    """, nativeQuery = true)
    MemberStatisticDTO getMemberStatistics(@Param("memberId") Long memberId);

    @Query("SELECT m.id FROM Member m WHERE m.account.username = :username")
    Optional<Long> findMemberIdByUsername(@Param("username") String username);

    @Query("SELECT m FROM Member m WHERE m.account.username = :username")
    Optional<Member> findByUsername(@Param("username") String username);

    @Query("""
    SELECT gm.member
    FROM GroupMember gm
    WHERE gm.group.id = :groupId
      AND gm.role = 'OWNER'
      AND gm.status = 'ACTIVE'
""")
    Optional<Member> findGroupOwnerByGroupId(@Param("groupId") Long groupId);

}



