package org.capstone.backend.service.group;

import org.capstone.backend.dto.group.*;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.utils.enums.GroupMemberStatus;

import java.util.List;

public interface GroupService {
    List<GroupResponse> getGroupsByMemberId(Long memberId);
    Groups createGroup(GroupRequest request, Long createdBy);
    Groups updateGroup(Long groupId, GroupRequest request, Long updatedBy);
    void kickMember(Long groupId, Long memberId, String username);
    void leaveGroup(Long groupId, String username);
    void inviteMembers(GroupInviteRequest request);
    void respondToInvitation(Long groupId, String username, GroupMemberStatus status);
    List<GroupInvitationDTO> getPendingInvitations(String username);
    List<MemberSearchResponse> searchMembers(MemberSearchRequest request);
}
