package org.capstone.backend.repository;

import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.utils.enums.ChallengeRole;
import org.capstone.backend.utils.enums.ChallengeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
           c.id, c.name, c.summary, c.picture
       )
       FROM Challenge c
       WHERE c.status = 'APPROVED'\s
       AND c.id NOT IN (
           SELECT cm.challenge.id FROM ChallengeMember cm WHERE cm.member.id = :memberId
       )
       ORDER BY c.updatedAt DESC
      \s""")
    Page<ChallengeResponse> findApprovedChallengesNotJoined(@Param("memberId") Long memberId, Pageable pageable);

    @Query("""
   SELECT new org.capstone.backend.dto.challenge.MyChallengeBaseResponse(
       c.id, c.name, c.picture, c.status, cm.role, c.startDate, c.endDate
   )
   FROM ChallengeMember cm
   JOIN cm.challenge c
   WHERE cm.member.id = :memberId
   AND (:role IS NULL OR cm.role = :role) 
   ORDER BY c.updatedAt DESC
""")
    List<MyChallengeBaseResponse> findChallengesByMemberAndRole(@Param("memberId") Long memberId,
                                                                @Param("role") ChallengeRole role);
    ;

    @Query("""
    SELECT new org.capstone.backend.dto.challenge.ChallengeDetailResponse(
        c.id, c.name, c.description, c.summary, c.startDate, c.endDate, 
        c.picture, c.challengeType.name, 
        CASE WHEN EXISTS (
            SELECT 1 FROM ChallengeMember cm 
            WHERE cm.challenge.id = c.id AND cm.member.id = :memberId
        ) THEN true ELSE false END, 
        (SELECT COUNT(cm) FROM ChallengeMember cm WHERE cm.challenge.id = c.id),
        DATEDIFF(c.endDate, c.startDate)
    )
    FROM Challenge c
    WHERE c.id = :challengeId
    """)
    ChallengeDetailResponse findChallengeDetailByIdAndMemberId(
            @Param("challengeId") Long challengeId,
            @Param("memberId") Long memberId);


    @Query("SELECT c.id FROM Challenge c WHERE :today BETWEEN c.startDate AND c.endDate")
    List<Long> findChallengesHappeningToday(@Param("today") LocalDate today);
    List<Challenge> findByStatusAndStartDate(ChallengeStatus status, LocalDate startDate);
    List<Challenge> findByStatusAndEndDate(ChallengeStatus status, LocalDate endDate);

    @Query("SELECT c.id FROM Challenge c WHERE c.endDate = :today")
    List<Long> findChallengesEndingToday(@Param("today") LocalDate today);

    @Query("SELECT COUNT(*) FROM Challenge WHERE createdAt BETWEEN :start AND :end")
    Long countNewChallengesBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT DATE(c.createdAt), COUNT(c) FROM Challenge c WHERE c.createdAt BETWEEN :start AND :end GROUP BY DATE(c.createdAt) ORDER BY DATE(c.createdAt)")
    List<Object[]> countNewChallengesGroupedByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    Long countByStatus(ChallengeStatus status);

    @Query("SELECT c.status, COUNT(c) FROM Challenge c GROUP BY c.status")
    List<Object[]> countChallengesByStatus();
    int countByCreatedBy(Long memberId); // hoặc createdBy = username nếu dùng String

}
