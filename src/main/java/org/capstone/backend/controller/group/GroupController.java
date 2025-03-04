package org.capstone.backend.controller.group;

import org.capstone.backend.dto.group.GroupResponse;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.dto.group.GroupRequest;
import org.capstone.backend.service.AuthService;
import org.capstone.backend.service.group.GroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;
    private final AuthService authService;

    public GroupController(GroupService groupService,
                           AuthService authService) {
        this.groupService = groupService;
        this.authService = authService;
    }

    @GetMapping("/groupslist")
    public ResponseEntity<List<GroupResponse>> getMyGroupList() {
        Long memberId = getAuthenticatedMemberId();
        return ResponseEntity.ok(groupService.getGroupsByMemberId(memberId));
    }

    @PostMapping("/create")
    public ResponseEntity<Groups> createGroup(@RequestBody GroupRequest request) {
        Long memberId = getAuthenticatedMemberId();
        return ResponseEntity.ok(groupService.createGroup(request, memberId));
    }

    @PutMapping("/edit/{groupId}")
    public ResponseEntity<Groups> editGroup(@PathVariable Long groupId, @RequestBody GroupRequest request) {
        Long memberId = getAuthenticatedMemberId();
        return ResponseEntity.ok(groupService.updateGroup(groupId, request, memberId));
    }

    private Long getAuthenticatedMemberId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authService.getMemberIdFromAuthentication(authentication);
    }
}
