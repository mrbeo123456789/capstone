package org.capstone.backend.repository;

import org.capstone.backend.entity.ChallengeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChallengeTypeRepository extends JpaRepository<ChallengeType, Long> {
}
