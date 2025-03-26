package org.capstone.backend.repository;

import org.capstone.backend.entity.Interest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterestRepository extends JpaRepository<Interest, Long> {
    List<Interest> findByMembers_Id(Long memberId);
}
