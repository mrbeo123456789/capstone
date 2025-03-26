package org.capstone.backend.controller.group;

import org.capstone.backend.dto.group.*;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.service.group.GroupService;
import org.springframework.http.HttpStatus;
import org.capstone.backend.service.member.MemberService;
import org.capstone.backend.utils.enums.GroupMemberStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

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

    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public ResponseEntity<?> createGroup(
            @Validated @ModelAttribute("data") GroupRequest request,
            @RequestParam(value = "picture", required = false) MultipartFile picture
    ) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() ||
                    "anonymousUser".equals(authentication.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User is not authenticated");
            }
            String username = authentication.getName();
            return ResponseEntity.ok(groupService.createGroup(request, picture,username));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating Group: " + e.getMessage());
        }
    }

    @PutMapping("/edit/{groupId}")
    public ResponseEntity<Groups> editGroup(@PathVariable Long groupId, @RequestBody GroupRequest request) {
        Long memberId = getAuthenticatedMemberId();
        return ResponseEntity.ok(groupService.updateGroup(groupId, request, memberId));
    }
    @PostMapping("/{groupId}/kick")
    public ResponseEntity<String> kickMember(
            @PathVariable Long groupId,
            @RequestBody Map<String, Long> request
    ) {
        Long memberId = request.get("memberId");
        String username = getUsernameFromSecurityContext();

        groupService.kickMember(groupId, memberId, username);
        return ResponseEntity.ok("Member has been kicked from the group.");
    }

    // API để thành viên tự rời khỏi nhóm
    @PostMapping("/{groupId}/leave")
    public ResponseEntity<String> leaveGroup(@PathVariable Long groupId) {
        String username = getUsernameFromSecurityContext();

        groupService.leaveGroup(groupId, username);
        return ResponseEntity.ok("You have left the group.");
    }
    private String getUsernameFromSecurityContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("User is not authenticated");
        }

        return authentication.getName();
    }
    private Long getAuthenticatedMemberId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authService.getMemberIdFromAuthentication(authentication);
    }

    @PostMapping("/invite")
    public ResponseEntity<String> inviteMembers(@RequestBody GroupInviteRequest request) {
        groupService.inviteMembers(request);
        return ResponseEntity.ok("Lời mời đã được gửi đến các thành viên!");
    }

    @PostMapping("/search")
    public ResponseEntity<List<MemberSearchResponse>> searchMembers(@RequestBody MemberSearchRequest request) {
        String username = getUsernameFromSecurityContext();
        return ResponseEntity.ok(groupService.searchMembers(request,username));
    }


    @PostMapping("/respond")
    public ResponseEntity<String> respondToInvitation(@RequestBody GroupMemberRequest dto) {
        String username = getUsernameFromSecurityContext();
        groupService.respondToInvitation(dto.getGroupId(), username, dto.getStatus());
        return ResponseEntity.ok(dto.getStatus() == GroupMemberStatus.ACCEPTED ?
                "Bạn đã chấp nhận lời mời" : "Bạn đã từ chối lời mời");
    }
    @GetMapping("/invitations")
    public ResponseEntity<List<GroupInvitationDTO>> getPendingInvitations() {
        String username = getUsernameFromSecurityContext();
        List<GroupInvitationDTO> invitations = groupService.getPendingInvitations(username);
        return ResponseEntity.ok(invitations);
    }
}
