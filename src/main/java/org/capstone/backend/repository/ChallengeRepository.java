package org.capstone.backend.repository;

import org.capstone.backend.dto.challenge.AdminChallengesResponse;
import org.capstone.backend.dto.challenge.ChallengeDetailResponse;
import org.capstone.backend.dto.challenge.ChallengeResponse;
import org.capstone.backend.dto.challenge.MyChallengeResponse;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.utils.enums.ChallengeRole;
import org.capstone.backend.utils.enums.ChallengeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    @Query("""
       SELECT new org.capstone.backend.dto.challenge.AdminChallengesResponse(
           c.id, c.name, c.startDate, c.endDate, ct.name, c.status
       )
       FROM Challenge c
       JOIN c.challengeType ct
       ORDER BY 
           CASE WHEN c.status = 'PENDING' THEN 0 ELSE 1 END,
           c.createdAt DESC
       """)
    Page<AdminChallengesResponse> findAllByPriority(Pageable pageable);
    @Query("""
       SELECT new org.capstone.backend.dto.challenge.ChallengeResponse(
           c.id, c.name, c.summary, c.picture
       )
       FROM Challenge c
       WHERE c.status = 'APPROVED' 
       AND c.id NOT IN (
           SELECT cm.challenge.id FROM ChallengeMember cm WHERE cm.member.id = :memberId
       )
       ORDER BY c.updatedAt DESC
       """)
    Page<ChallengeResponse> findApprovedChallengesNotJoined(@Param("memberId") Long memberId, Pageable pageable);

    @Query("""
           SELECT new org.capstone.backend.dto.challenge.MyChallengeResponse(
               c.id, c.name, c.picture, c.status, cm.role
           )
           FROM ChallengeMember cm
           JOIN cm.challenge c
           WHERE cm.member.id = :memberId
           AND (:status IS NULL OR c.status = :status)
           ORDER BY c.updatedAt DESC
           """)
    List<MyChallengeResponse> findChallengesByMemberAndStatus(@Param("memberId") Long memberId,
                                                              @Param("status") ChallengeRole role);
    @Query("""
    SELECT new org.capstone.backend.dto.challenge.ChallengeDetailResponse(
        c.id, c.name, c.description, c.summary, c.startDate, c.endDate, 
        c.picture, c.challengeType.name, 
        CASE WHEN EXISTS (
            SELECT 1 FROM ChallengeMember cm 
            WHERE cm.challenge.id = c.id AND cm.member.id = :memberId
        ) THEN true ELSE false END, 
        (SELECT COUNT(cm) FROM ChallengeMember cm WHERE cm.challenge.id = c.id)
    )
    FROM Challenge c
    WHERE c.id = :challengeId
    """)
    ChallengeDetailResponse findChallengeDetailByIdAndMemberId(
            @Param("challengeId") Long challengeId,
            @Param("memberId") Long memberId);


}
