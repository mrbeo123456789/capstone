package org.capstone.backend.repository;

import org.capstone.backend.dto.group.GroupMemberRankingDTO;
import org.capstone.backend.dto.group.MemberSearchResponse;
import org.capstone.backend.dto.group.MyGroupResponse;
import org.capstone.backend.entity.GroupMember;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.entity.Member;
import org.capstone.backend.utils.enums.GroupChallengeStatus;
import org.capstone.backend.utils.enums.GroupMemberStatus;
import org.capstone.backend.utils.enums.InvitePermission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

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
    @Query("SELECT gm.member FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.status = :status")
    List<Member> findMembersByGroupIdAndStatus(@Param("groupId") Long groupId,
                                               @Param("status") GroupMemberStatus status);

    // Nếu cần, thêm method lấy groupIds của thành viên:
    List<Long> findGroupIdsByMemberId(Long memberId);

    void deleteByGroupId(Long groupId);

    @Query(value = """
    SELECT new org.capstone.backend.dto.group.MemberSearchResponse(
        gm.member.id,
        gm.member.account.email,
        gm.member.avatar,
        gm.member.fullName,
        NULL
    )
    FROM GroupMember gm
    JOIN gm.group g
    WHERE gm.role = 'OWNER'
    AND gm.status = :groupMemberStatus
    AND gm.member.invitePermission = :invitePermission
    AND gm.member.id <> :currentMemberId
    AND gm.member.id <> :creatorId
    AND g.id NOT IN (
        SELECT gc.group.id
        FROM GroupChallenge gc
        WHERE gc.challenge.id = :challengeId
        AND gc.status IN (:pendingStatus, :ongoingStatus)
    )
    AND (gm.member.account.email LIKE %:keyword% OR gm.member.fullName LIKE %:keyword%)
    AND (
        SELECT COUNT(gm2)
        FROM GroupMember gm2
        WHERE gm2.group = g
        AND gm2.status = :groupMemberStatus
    ) >= 2
    ORDER BY gm.member.fullName ASC
""")
    List<MemberSearchResponse> searchAvailableGroupLeaders(
            @Param("challengeId") Long challengeId,
            @Param("keyword") String keyword,
            @Param("groupMemberStatus") GroupMemberStatus groupMemberStatus,
            @Param("pendingStatus") GroupChallengeStatus pendingStatus,
            @Param("ongoingStatus") GroupChallengeStatus ongoingStatus,
            @Param("invitePermission") InvitePermission invitePermission,
            @Param("currentMemberId") Long currentMemberId,
            @Param("creatorId") Long creatorId,
            Pageable pageable
    );


    @Query(value = """
    SELECT g.group_id AS groupId,
           g.group_name AS groupName,
           g.picture AS groupPicture,
           COUNT(gm_all.group_member_id) AS memberCount
    FROM `groups` g
    JOIN group_members gm_owner ON gm_owner.group_id = g.group_id
    JOIN group_members gm_all ON gm_all.group_id = g.group_id AND gm_all.status = 'ACTIVE'
    WHERE gm_owner.member_id = :memberId
      AND gm_owner.role = 'OWNER'
      AND gm_owner.status = 'ACTIVE'
      AND g.group_id NOT IN (
          SELECT gc.group_id FROM group_challenge gc WHERE gc.status = 'ONGOING'
      )
    GROUP BY g.group_id, g.group_name, g.picture
    HAVING COUNT(gm_all.group_member_id) > 1
    ORDER BY g.group_name ASC
    """, nativeQuery = true)
    List<Object[]> findAvailableGroupsWithMemberCount(@Param("memberId") Long memberId);


    List<GroupMember> findByMemberAndRoleAndStatus(Member member, String owner, GroupMemberStatus groupMemberStatus);

    List<GroupMember> findByGroupId(Long groupId);

    @Query("""
    SELECT new org.capstone.backend.dto.group.GroupMemberRankingDTO(
        m.id,
        m.fullName,
        m.avatar,
        CAST(COALESCE(r.totalStars, 0) AS long),
        gm.createdAt
    )
    FROM GroupMember gm
    JOIN gm.member m
    LEFT JOIN GlobalMemberRanking r ON r.memberId = m.id
    WHERE gm.group.id = :groupId
      AND gm.status = 'ACTIVE'
      AND LOWER(m.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
    ORDER BY COALESCE(r.totalStars, 0) DESC, gm.createdAt ASC
""")
    Page<GroupMemberRankingDTO> searchGroupRankingWithKeyword(
            @Param("groupId") Long groupId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

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
    """)
    Page<MyGroupResponse> findMyGroups(Long memberId, String keyword, Pageable pageable);
}

