package org.capstone.backend.repository;

import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeMember;
import org.capstone.backend.entity.Member;
import org.capstone.backend.utils.enums.ChallengeMemberStatus;
import org.capstone.backend.utils.enums.ChallengeRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
    @Query("SELECT cm.member.id FROM ChallengeMember cm WHERE cm.challenge.id = :challengeId")
    List<Long> findMemberIdsByChallengeId(@Param("challengeId") Long challengeId);
}
