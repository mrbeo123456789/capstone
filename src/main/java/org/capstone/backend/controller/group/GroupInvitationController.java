package org.capstone.backend.controller.group;

import org.capstone.backend.entity.GroupInvitation;
import org.capstone.backend.service.group.GroupInvitationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/group/invitations")
public class GroupInvitationController {

    private final GroupInvitationService groupInvitationService;

    public GroupInvitationController(GroupInvitationService groupInvitationService) {
        this.groupInvitationService = groupInvitationService;
    }

    @PostMapping("/create/{groupId}")
    public ResponseEntity<GroupInvitation> createInvitation(@PathVariable Long groupId, @RequestBody List<String> emails) {
        GroupInvitation invitation = groupInvitationService.createInvitation(groupId, emails);
        return ResponseEntity.ok(invitation);
    }

    @PutMapping("/update/{groupId}")
    public ResponseEntity<GroupInvitation> updateInvitation(@PathVariable Long groupId, @RequestBody List<String> emails) {
        GroupInvitation invitation = groupInvitationService.updateInvitation(groupId, emails);
        return ResponseEntity.ok(invitation);
    }

    @GetMapping("/accept")
    public ResponseEntity<String> acceptInvitation(@RequestParam String inviteCode) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Bạn cần đăng nhập để chấp nhận lời mời.");
        }

        String username = authentication.getName(); // Lấy username từ JWT
        String groupUrl = groupInvitationService.acceptInvitation(inviteCode, username); // Gửi username vào service

        return ResponseEntity.ok(groupUrl);
    }

}
