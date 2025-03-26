package org.capstone.backend.repository;

import org.capstone.backend.entity.GroupMember;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.entity.Member;
import org.capstone.backend.utils.enums.GroupMemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    Optional<GroupMember> findByGroupAndMember(Groups group, Member member);
    List<GroupMember> findByMemberAndStatus(Member member, GroupMemberStatus status);
    boolean existsByGroupAndMember(Groups group, Member member);
    @Query("SELECT gm.member.id FROM GroupMember gm WHERE gm.group = :group")
    Set<Long> findMemberIdsByGroup(@Param("group") Groups group);
    Optional<GroupMember> findByGroupIdAndMemberIdAndStatus(Long groupId, Long memberId, GroupMemberStatus status);
}
