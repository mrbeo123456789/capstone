package org.capstone.backend.repository;

import org.capstone.backend.dto.challenge.AdminChallengesResponse;
import org.capstone.backend.dto.challenge.ChallengeResponse;
import org.capstone.backend.entity.Challenge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

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
       ORDER BY c.updatedAt DESC
       """)
    Page<ChallengeResponse> findApprovedChallenges(Pageable pageable);

}
