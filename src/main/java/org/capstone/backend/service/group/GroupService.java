package org.capstone.backend.service.group;

import org.capstone.backend.dto.group.*;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.dto.group.GroupRequest;
import org.capstone.backend.entity.Member;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;
import org.capstone.backend.utils.enums.GroupMemberStatus;

import java.util.List;
import java.util.Optional;

public interface GroupService {
    List<GroupResponse> getGroupsByMemberId();
    GroupResponse getGroupsDetail(Long groupId);

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

    // ✅ SEARCH
    List<MemberSearchResponse> searchMembers(MemberSearchRequest request);
}
