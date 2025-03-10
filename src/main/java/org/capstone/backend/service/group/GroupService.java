package org.capstone.backend.service.group;

import org.capstone.backend.dto.group.GroupResponse;
import org.capstone.backend.entity.GroupInvitation;
import org.capstone.backend.entity.GroupMember;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.dto.group.GroupRequest;
import org.capstone.backend.entity.Member;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

public interface GroupService {
    List<GroupResponse> getGroupsByMemberId(Long memberId);
    Groups createGroup(GroupRequest request, Long createdBy);
    Groups updateGroup(Long groupId, GroupRequest request, Long updatedBy);
    void kickMember(Long groupId, Long memberId, String username);
    void leaveGroup(Long groupId, String username);
}
