package org.capstone.backend.repository;

import org.capstone.backend.entity.GroupMember;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    boolean existsByGroupAndMember(Groups group, Member member);

    Optional<GroupMember> findByGroupIdAndMemberId(Long groupId, Long memberId);
}
