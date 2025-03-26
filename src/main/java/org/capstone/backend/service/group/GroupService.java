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
    List<GroupResponse> getGroupsByMemberId(Long memberId);
    Groups createGroup(GroupRequest request, MultipartFile picture , String createdBy);
    Groups updateGroup(Long groupId, GroupRequest request, Long updatedBy);
    void kickMember(Long groupId, Long memberId, String username);
    void leaveGroup(Long groupId, String username);
    void inviteMembers(GroupInviteRequest request);
    void respondToInvitation(Long groupId, String username, GroupMemberStatus status);
    List<GroupInvitationDTO> getPendingInvitations(String username);
    List<MemberSearchResponse> searchMembers(MemberSearchRequest request,String username);
}
