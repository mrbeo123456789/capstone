package org.capstone.backend.repository;

import org.capstone.backend.dto.group.GroupSummaryDTO;
import org.capstone.backend.entity.Groups;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupRepository extends JpaRepository<Groups, Long> {

    @Query("SELECT g FROM Groups g JOIN GroupMember gm ON g.id = gm.group.id WHERE gm.member.id = :memberId and gm.status= 'active'")
    List<Groups> findByMemberId(@Param("memberId") Long memberId);
    @Query("""
        SELECT new org.capstone.backend.dto.group.GroupSummaryDTO(
            g.id,
            g.name,
            SIZE(g.members),
            g.createdAt,
            g.picture
        )
        FROM Groups g
        WHERE :keyword IS NULL OR LOWER(g.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
        ORDER BY g.createdAt DESC
    """)
    Page<GroupSummaryDTO> searchGroupsByName(@Param("keyword") String keyword, Pageable pageable);
}
