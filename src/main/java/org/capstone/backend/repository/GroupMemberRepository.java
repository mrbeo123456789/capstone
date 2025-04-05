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
    @Query("SELECT COUNT(gm) > 0 FROM GroupMember gm " +
            "WHERE gm.group.id = (SELECT gm2.group.id FROM GroupMember gm2 WHERE gm2.member.id = :memberId1) " +
            "AND gm.member.id = :memberId2")
    boolean checkIfInSameGroup(@Param("memberId1") Long memberId1, @Param("memberId2") Long memberId2);
    Optional<GroupMember> findByGroupIdAndMemberIdAndStatus(Long groupId, Long memberId, GroupMemberStatus status);
    Optional<GroupMember> findByGroupIdAndMemberId(Long groupId, Long memberId);

    @Query("SELECT gm.member.id FROM GroupMember gm WHERE gm.group.id IN " +
            "(SELECT gm2.group.id FROM GroupMember gm2 WHERE gm2.member.id = :currentMemberId AND gm2.status = 'ACTIVE') " +
            "AND gm.member.id IN :memberIds AND gm.status = 'ACTIVE'")
    List<Long> findCommonGroupMemberIds(@Param("currentMemberId") Long currentMemberId,
                                        @Param("memberIds") List<Long> memberIds);

    @Query("SELECT gm.member.id FROM GroupMember gm WHERE gm.member.id IN :memberIds " +
            "AND gm.group.id IN (SELECT gm2.group.id FROM GroupMember gm2 WHERE gm2.member.id = :currentMemberId AND gm2.status = 'ACTIVE') " +
            "AND gm.status = 'ACTIVE'")
    List<Long> findAlreadyJoinedActiveMemberIds(@Param("currentMemberId") Long currentMemberId,
                                                @Param("memberIds") List<Long> memberIds);
    // Method hiện tại

    // Nếu cần, thêm method lấy groupIds của thành viên:
    List<Long> findGroupIdsByMemberId(Long memberId);

    void deleteByGroupId(Long groupId);
}
