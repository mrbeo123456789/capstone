package org.capstone.backend.repository;

import org.capstone.backend.entity.Achievement;
import org.capstone.backend.utils.enums.AchievementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    Optional<Achievement> findByType(AchievementType type);
}
