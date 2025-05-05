package org.capstone.backend.repository;

import org.capstone.backend.entity.Interest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InterestRepository extends JpaRepository<Interest, Long> {
    Page<Interest> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
    @Query("SELECT i FROM Interest i JOIN i.members m WHERE m.id = :memberId AND i.active = true")
    List<Interest> findActiveByMemberId(@Param("memberId") Long memberId);

    @Query("SELECT i FROM Interest i WHERE i.active = true AND i.id NOT IN (" +
            "SELECT i2.id FROM Interest i2 JOIN i2.members m2 WHERE m2.id = :memberId)")
    List<Interest> findActiveNotOwnedByMemberId(@Param("memberId") Long memberId);
    @Query("SELECT i FROM Interest i WHERE i.active = true")
    List<Interest> findAllActive();
    @Query("SELECT i FROM Interest i WHERE i.active = true AND i.id IN :ids")
    List<Interest> findAllActiveByIdIn(@Param("ids") List<Long> ids);


}
