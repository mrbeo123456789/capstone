package org.capstone.backend.repository;

import org.capstone.backend.entity.Groups;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupRepository extends JpaRepository<Groups, Long> {

    @Query("SELECT g FROM Groups g JOIN GroupMember gm ON g.id = gm.group.id WHERE gm.member.id = :memberId and gm.status= 'active'")
    List<Groups> findByMemberId(@Param("memberId") Long memberId);
}
