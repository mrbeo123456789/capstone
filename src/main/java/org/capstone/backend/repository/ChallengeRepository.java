package org.capstone.backend.repository;

import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeStarRating;
import org.capstone.backend.entity.GroupChallenge;
import org.capstone.backend.utils.enums.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    @Query("""
       SELECT new org.capstone.backend.dto.challenge.AdminChallengesResponse(
           c.id, c.name, c.startDate, c.endDate, ct.name, c.status
       )
       FROM Challenge c
       JOIN c.challengeType ct
       WHERE (:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))
         AND (:status IS NULL OR c.status = :status)
       ORDER BY 
           CASE c.status WHEN org.capstone.backend.utils.enums.ChallengeStatus.PENDING THEN 0 ELSE 1 END ASC,
           c.createdAt DESC
    """)
    Page<AdminChallengesResponse> findAllByStatusAndPriority(
            @Param("name") String name,
            @Param("status") ChallengeStatus status,
            Pageable pageable);


    @Query("""
    SELECT new org.capstone.backend.dto.challenge.ChallengeResponse(
        c.id, c.name, c.summary, c.picture, c.participationType
    )
    FROM Challenge c
    LEFT JOIN ChallengeMember cm ON cm.challenge.id = c.id AND cm.member.id = :memberId
    WHERE c.status = 'UPCOMING'
    AND (cm.id IS NULL OR (cm.status != 'JOINED' AND cm.status != 'KICKED'))
    ORDER BY c.updatedAt DESC
""")
    Page<ChallengeResponse> findApprovedChallengesNotJoined(@Param("memberId") Long memberId, Pageable pageable);


    @Query("""
       SELECT new org.capstone.backend.dto.challenge.MyChallengeBaseResponse(
           c.id, c.name, c.picture, c.status, cm.role, c.startDate, c.endDate, c.participationType
       )
       FROM ChallengeMember cm
       JOIN cm.challenge c
       WHERE cm.member.id = :memberId
         AND cm.status = org.capstone.backend.utils.enums.ChallengeMemberStatus.JOINED
         AND (:role IS NULL OR cm.role = :role)
       ORDER BY c.updatedAt DESC
    """)
    List<MyChallengeBaseResponse> findChallengesByMemberAndRole(
            @Param("memberId") Long memberId,
            @Param("role") ChallengeRole role
    );

    @Query("""
    SELECT new org.capstone.backend.dto.challenge.ChallengeDetailResponse(
        c.id, 
        c.name, 
        c.description, 
        c.summary, 
        c.startDate, 
        c.endDate, 
        c.picture,
        c.banner, 
        c.challengeType.name,
        c.maxParticipants,
        CASE 
            WHEN :memberId IS NULL THEN false
            WHEN EXISTS (
                SELECT 1 
                FROM ChallengeMember cm 
                WHERE cm.challenge.id = c.id 
                  AND cm.member.id = :memberId 
                  AND cm.status = org.capstone.backend.utils.enums.ChallengeMemberStatus.JOINED
            ) THEN true 
            ELSE false 
        END,
        (SELECT COUNT(cm) 
         FROM ChallengeMember cm 
         WHERE cm.challenge.id = c.id
           AND cm.status = org.capstone.backend.utils.enums.ChallengeMemberStatus.JOINED
        ),
        DATEDIFF(c.endDate, c.startDate), 
        c.status,                
        c.verificationType,
        c.participationType,
        (
            SELECT cm.role 
            FROM ChallengeMember cm 
            WHERE cm.challenge.id = c.id 
              AND cm.member.id = :memberId
              AND cm.status = org.capstone.backend.utils.enums.ChallengeMemberStatus.JOINED
        )
    )
    FROM Challenge c
    WHERE c.id = :challengeId
    """)
    ChallengeDetailResponse findChallengeDetailByIdAndMemberId(
            @Param("challengeId") Long challengeId,
            @Param("memberId") Long memberId
    );



    @Query("SELECT c.id FROM Challenge c " +
            "WHERE c.status = :status " +
            "AND c.verificationType = :verificationType")
    List<Long> findCrossCheckChallengesHappeningToday(@Param("status") ChallengeStatus status,
                                                      @Param("verificationType") VerificationType verificationType);


    List<Challenge> findByStatusAndStartDate(ChallengeStatus status, LocalDate startDate);
    List<Challenge> findByStatusAndEndDate(ChallengeStatus status, LocalDate endDate);

    @Query("""
            SELECT c.id FROM Challenge c WHERE c.endDate = :today AND c.verificationType = org.capstone.backend.utils.enums.VerificationType.MEMBER_REVIEW""")
    List<Long> findChallengesEndingToday(@Param("today") LocalDate today);


    @Query("SELECT COUNT(*) FROM Challenge WHERE createdAt BETWEEN :start AND :end")
    Long countNewChallengesBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT DATE(c.createdAt), COUNT(c) FROM Challenge c WHERE c.createdAt BETWEEN :start AND :end GROUP BY DATE(c.createdAt) ORDER BY DATE(c.createdAt)")
    List<Object[]> countNewChallengesGroupedByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    Long countByStatus(ChallengeStatus status);

    @Query("SELECT c.status, COUNT(c) FROM Challenge c GROUP BY c.status")
    List<Object[]> countChallengesByStatus();
    int countByCreatedBy(String createdBy);
    @Query("SELECT c.id FROM Challenge c WHERE c.status = 'ONGOING'")
    List<Long> findAllOngoingChallengeIds();

    @Query("""
    SELECT c FROM Challenge c
    WHERE c.status = :status
    AND (c.startDate > :date OR c.startDate = :date)
""")
    Page<Challenge> findUpcomingChallenges(
            @Param("status") ChallengeStatus status,
            @Param("date") LocalDate date,
            Pageable pageable
    );
    List<Challenge> findByStatus(ChallengeStatus status);

    @Query("SELECT COUNT(cm) FROM ChallengeMember cm WHERE cm.challenge.id = :challengeId")
    int countParticipants(@Param("challengeId") Long challengeId);

    @Query("""
    SELECT c.name, ct.name, COUNT(cm), COUNT(cr), c.status
    FROM Challenge c
    JOIN c.challengeType ct
    LEFT JOIN ChallengeMember cm ON cm.challenge.id = c.id
    LEFT JOIN ChallengeReport cr ON cr.challenge.id = c.id
    WHERE c.createdBy = :creator
    AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
    AND (:status IS NULL OR c.status = :status)
    GROUP BY c.id
""")
    List<Object[]> findDashboardChallengesRaw(
            @Param("creator") String creator,
            @Param("keyword") String keyword,
            @Param("status") ChallengeStatus status
    );
    @Query("""
    SELECT c.name, COUNT(cm.id)
    FROM Challenge c
    JOIN ChallengeMember cm ON cm.challenge.id = c.id
    WHERE c.createdBy = :creator
      AND cm.isParticipate = true
      AND cm.status = :status
    GROUP BY c.id
""")
    List<Object[]> countActiveParticipantsPerAdminChallenge(@Param("creator") String creator,
                                                            @Param("status") ChallengeMemberStatus status);
    @Query("SELECT cr.challenge.name, COUNT(cr) " +
            "FROM ChallengeReport cr " +
            "WHERE cr.challenge.createdBy = :creator " +
            "GROUP BY cr.challenge.name")
    List<Object[]> countReportsOfAdminChallenges(@Param("creator") String creator);
    Long countByCreatedByAndStatus(String creator, ChallengeStatus status);
}
