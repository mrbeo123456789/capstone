package org.capstone.backend.controller.group;

import org.capstone.backend.dto.challenge.GroupChallengeHistoryDTO;
import org.capstone.backend.dto.group.*;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.service.group.GroupService;
import org.capstone.backend.utils.enums.GroupChallengeStatus;
import org.capstone.backend.utils.enums.GroupMemberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;
    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    // ✅ Lấy danh sách nhóm của thành viên hiện tại
    @GetMapping("/groupslist")
    public ResponseEntity<List<GroupResponse>> getMyGroupList() {
        return ResponseEntity.ok(groupService.getGroupsByMemberId());
    }

    // ✅ Lấy chi tiết một nhóm
    @GetMapping("/detail/{groupId}")
    public ResponseEntity<GroupResponse> getGroupDetail(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroupsDetail(groupId));
    }

    // ✅ Tạo nhóm mới
    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public ResponseEntity<?> createGroup(
            @Validated @ModelAttribute("data") GroupRequest request,
            @RequestParam(value = "picture", required = false) MultipartFile picture
    ) {
        try {
            return ResponseEntity.ok(groupService.createGroup(request, picture));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating group: " + e.getMessage());
        }
    }

    // ✅ Chỉnh sửa nhóm
    @PutMapping("/edit/{groupId}")
    public ResponseEntity<Groups> editGroup(@PathVariable Long groupId, @RequestBody GroupRequest request) {
        return ResponseEntity.ok(groupService.updateGroup(groupId, request));
    }

    // ✅ Kick thành viên khỏi nhóm
    @PostMapping("/{groupId}/kick")
    public ResponseEntity<String> kickMember(
            @PathVariable Long groupId,
            @RequestBody Map<String, Long> request
    ) {
        Long memberId = request.get("memberId");
        groupService.kickMember(groupId, memberId);
        return ResponseEntity.ok("Thành viên đã bị loại khỏi nhóm.");
    }

    // ✅ Thành viên tự rời khỏi nhóm
    @PostMapping("/{groupId}/leave")
    public ResponseEntity<String> leaveGroup(@PathVariable Long groupId) {
        groupService.leaveGroup(groupId); // không cần username
        return ResponseEntity.ok("Bạn đã rời khỏi nhóm.");
    }

    // ✅ Mời thành viên vào nhóm
    @PostMapping("/invite")
    public ResponseEntity<String> inviteMembers(@RequestBody GroupInviteRequest request) {
        groupService.inviteMembers(request);
        return ResponseEntity.ok("Lời mời đã được gửi đến các thành viên.");
    }

    // ✅ Tìm kiếm thành viên
    @PostMapping("/search")
    public ResponseEntity<List<MemberSearchResponse>> searchMembers(@RequestBody MemberSearchRequest request) {
        // Vẫn cần username vì hàm có tham số username
        return ResponseEntity.ok(groupService.searchMembers(request));
    }

    // ✅ Phản hồi lời mời
    @PostMapping("/respond")
    public ResponseEntity<String> respondToInvitation(@RequestBody GroupMemberRequest dto) {
        groupService.respondToInvitation(dto.getGroupId(), dto.getStatus());
        return ResponseEntity.ok(dto.getStatus() == GroupMemberStatus.ACCEPTED ?
                "Bạn đã chấp nhận lời mời." : "Bạn đã từ chối lời mời.");
    }

    // ✅ Xem các lời mời đang chờ xử lý
    @GetMapping("/invitations")
    public ResponseEntity<List<GroupInvitationDTO>> getPendingInvitations() {
        return ResponseEntity.ok(groupService.getPendingInvitations());
    }
    @DeleteMapping("/{groupId}/disband")
    public ResponseEntity<?> disbandGroup(@PathVariable Long groupId) {
        try {
            groupService.disbandGroup(groupId);
            return ResponseEntity.ok("Nhóm đã được giải tán.");
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }
    @GetMapping("/available-to-join")
    public ResponseEntity<List<AvailableGroupResponse>> getAvailableGroups() {
        List<AvailableGroupResponse> availableGroups = groupService.getAvailableGroupsToJoinChallenge();
        return ResponseEntity.ok(availableGroups);
    }
    @GetMapping("/{groupId}/challenge-history")
    public ResponseEntity<Page<GroupChallengeHistoryDTO>> getGroupChallengeHistory(
            @PathVariable Long groupId,
            @RequestParam(required = false) GroupChallengeStatus status,
            @RequestParam(defaultValue = "0") int page
    ) {
        Page<GroupChallengeHistoryDTO> history = groupService.getGroupChallengeHistories(groupId, status, page);
        return ResponseEntity.ok(history);
    }


}
