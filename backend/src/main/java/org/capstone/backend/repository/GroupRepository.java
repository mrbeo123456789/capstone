package org.capstone.backend.repository;

import org.capstone.backend.dto.group.GroupSummaryDTO;
import org.capstone.backend.dto.group.MyGroupResponse;
import org.capstone.backend.entity.Groups;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupRepository extends JpaRepository<Groups, Long> {

    @Query("""
    SELECT g FROM Groups g
    JOIN GroupMember gm ON g.id = gm.group.id
    WHERE gm.member.id = :memberId
      AND gm.status = org.capstone.backend.utils.enums.GroupMemberStatus.ACTIVE
""")
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

    @Query("""
    SELECT new org.capstone.backend.dto.group.MyGroupResponse(
        g.id,
        g.name,
        g.picture,
        gm.role,
        SIZE(g.members)
    )
    FROM GroupMember gm
    JOIN gm.group g
    WHERE gm.member.id = :memberId
      AND gm.status = org.capstone.backend.utils.enums.GroupMemberStatus.ACTIVE
      AND (:keyword IS NULL OR LOWER(g.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
      AND (:requiredMembers IS NULL OR SIZE(g.members) = :requiredMembers)
""")
    Page<MyGroupResponse> findMyGroups(
            @Param("memberId") Long memberId,
            @Param("keyword") String keyword,
            @Param("requiredMembers") Integer requiredMembers,
            Pageable pageable
    );


}
