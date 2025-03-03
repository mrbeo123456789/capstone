package org.capstone.backend.service.group;

import org.capstone.backend.dto.group.GroupResponse;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.dto.group.GroupRequest;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface GroupService {
    List<GroupResponse> getGroupsByMemberId(Long memberId);
    Groups createGroup(GroupRequest request, Long createdBy);
    Groups updateGroup(Long groupId, GroupRequest request, Long updatedBy);
    Long getMemberIdFromAuthentication(Authentication authentication);
}
