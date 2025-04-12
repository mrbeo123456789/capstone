package org.capstone.backend.service.group;

import org.capstone.backend.dto.challenge.GroupChallengeHistoryDTO;
import org.capstone.backend.dto.group.*;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.dto.group.GroupRequest;
import org.capstone.backend.entity.Member;
import org.capstone.backend.utils.enums.GroupChallengeStatus;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;
import org.capstone.backend.utils.enums.GroupMemberStatus;

import java.util.List;
import java.util.Optional;

public interface GroupService {
    List<GroupResponse> getGroupsByMemberId();
    GroupResponse getGroupsDetail(Long groupId);
    List<AvailableGroupResponse> getAvailableGroupsToJoinChallenge();
    // ✅ CREATE & UPDATE group
    Groups createGroup(GroupRequest request, MultipartFile picture);
    Groups updateGroup(Long groupId, GroupRequest request);

    // ✅ MEMBER ACTIONS
    void kickMember(Long groupId, Long memberId);
    void leaveGroup(Long groupId);

    // ✅ INVITATION FLOW
    void inviteMembers(GroupInviteRequest request);
    void respondToInvitation(Long groupId, GroupMemberStatus status);
    List<GroupInvitationDTO> getPendingInvitations();
    Page<GroupSummaryDTO> searchGroups(String keyword, int page, int size);
    void disbandGroup(Long groupId);
    // ✅ SEARCH
    List<MemberSearchResponse> searchMembers(MemberSearchRequest request);
    Page<GroupChallengeHistoryDTO> getGroupChallengeHistories(Long groupId, GroupChallengeStatus status, int page);
}
