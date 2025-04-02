package org.capstone.backend.repository;

import org.capstone.backend.entity.Achievement;
import org.capstone.backend.entity.Member;
import org.capstone.backend.entity.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {
    boolean existsByMemberAndAchievement(Member member, Achievement achievement);
    List<UserAchievement> findByMember(Member member);
}
