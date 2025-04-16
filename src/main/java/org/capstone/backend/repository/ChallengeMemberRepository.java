package org.capstone.backend.repository;

import org.capstone.backend.dto.member.MemberSubmissionProjection;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeMember;
import org.capstone.backend.entity.Member;
import org.capstone.backend.utils.enums.ChallengeMemberStatus;
import org.capstone.backend.utils.enums.ChallengeRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChallengeMemberRepository extends JpaRepository<ChallengeMember, Long> {
    List<ChallengeMember> findByMemberAndStatus(Member member, ChallengeMemberStatus status);
    Optional<ChallengeMember> findByMemberAndChallenge(Member member, Challenge challenge);
    int countByChallengeAndStatus(Challenge challenge, ChallengeMemberStatus status);
    boolean existsByChallengeIdAndMemberIdAndStatus(Long challengeId, Long memberId, ChallengeMemberStatus status);
    @Query("SELECT cm.member FROM ChallengeMember cm " +
            "WHERE cm.challenge.id = :challengeId AND cm.member.id <> :excludeMemberId AND cm.status = 'JOINED' ")
    List<Member> findMembersByChallengeIdExceptUser(@Param("challengeId") Long challengeId,
                                                    @Param("excludeMemberId") Long excludeMemberId);
    // Tìm Host của Challenge
    @Query("""
           SELECT cm FROM ChallengeMember cm 
           WHERE cm.challenge.id = :challengeId 
           AND cm.role = 'HOST'
           """)
    Optional<ChallengeMember> findHostByChallengeId(@Param("challengeId") Long challengeId);

    // Tìm thành viên trong Challenge
    @Query("""
           SELECT cm FROM ChallengeMember cm 
           WHERE cm.challenge.id = :challengeId 
           AND cm.member.id = :memberId
           """)
    Optional<ChallengeMember> findByChallengeIdAndMemberId(@Param("challengeId") Long challengeId,
                                                           @Param("memberId") Long memberId);
    boolean existsByChallengeAndMember(Challenge challenge, Member member);

    // Cập nhật Role của một thành viên trong Challenge
    @Modifying
    @Query("""
           UPDATE ChallengeMember cm 
           SET cm.role = :newRole 
           WHERE cm.challenge.id = :challengeId 
           AND cm.member.id = :memberId
           """)
    void updateRole(@Param("challengeId") Long challengeId,
                    @Param("memberId") Long memberId,
                    @Param("newRole") ChallengeRole newRole);
    int countByMemberId(Long memberId);
    int countByMemberIdAndIsCompletedTrue(Long memberId);
    List<ChallengeMember> findByChallengeId(Long challengeId);
    @Query("SELECT cm.member.id FROM ChallengeMember cm WHERE cm.challenge.id = :challengeId AND cm.status = 'JOINED'")
    List<Long> findMemberIdsByChallengeId(@Param("challengeId") Long challengeId);
    List<ChallengeMember> findByChallenge(Challenge challenge);
    // New method to find members of a specific group in a challenge
    @Query("SELECT cm FROM ChallengeMember cm WHERE cm.challenge = :challenge AND cm.groupId = :groupId")
    List<ChallengeMember> findByChallengeAndGroupId(@Param("challenge") Challenge challenge, @Param("groupId") Long groupId);

    @Query("SELECT cm FROM ChallengeMember cm " +
            "JOIN cm.challenge c " +
            "WHERE cm.member.id = :memberId " +
            "AND c.status = 'ONGOING' " +
            "AND c.startDate <= :lastDayOfMonth " +
            "AND c.endDate >= :firstDayOfMonth")
    List<ChallengeMember> findOngoingChallengesForMemberInCurrentMonth(@Param("memberId") Long memberId,
                                                                       @Param("firstDayOfMonth") LocalDate firstDayOfMonth,

                                                                       @Param("lastDayOfMonth") LocalDate lastDayOfMonth);
    @Query(value = """
    SELECT m.id AS id,
           m.full_name AS fullName,
           CASE 
               WHEN EXISTS (
                   SELECT 1
                   FROM evidence e
                   WHERE e.member_id = m.id
                     AND e.challenge_id = :challengeId
                     AND e.status = 'PENDING'
               ) THEN TRUE 
               ELSE FALSE 
           END AS hasPendingEvidence
    FROM challenge_member cm
    JOIN member m ON cm.member_id = m.id
    WHERE cm.challenge_id = :challengeId
      AND cm.status = 'JOINED'
      AND LOWER(m.full_name) LIKE LOWER(CONCAT('%', :keyword, '%'))
    ORDER BY m.full_name
    """,
            countQuery = """
    SELECT COUNT(*)
    FROM challenge_member cm
    JOIN member m ON cm.member_id = m.id
    WHERE cm.challenge_id = :challengeId
      AND cm.status = 'JOINED'
      AND LOWER(m.full_name) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """,
            nativeQuery = true)
    Page<MemberSubmissionProjection> findMembersWithPendingEvidence(
            @Param("challengeId") Long challengeId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

}
