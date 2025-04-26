package org.capstone.backend.controller.group;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.challenge.GroupChallengeHistoryDTO;
import org.capstone.backend.dto.group.*;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.service.group.GroupService;
import org.capstone.backend.utils.enums.GroupChallengeStatus;
import org.capstone.backend.utils.enums.GroupMemberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping("/groupslist")
    public ResponseEntity<List<GroupResponse>> getMyGroupList() {
        return ResponseEntity.ok(groupService.getGroupsByMemberId());
    }

    @GetMapping("/detail/{groupId}")
    public ResponseEntity<GroupResponse> getGroupDetail(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroupsDetail(groupId));
    }

    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public ResponseEntity<String> createGroup(
            @Validated @ModelAttribute("data") GroupRequest request,
            @RequestParam(value = "picture", required = false) MultipartFile picture
    ) {
        String response = groupService.createGroup(request, picture);
        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/edit/{groupId}", consumes = {"multipart/form-data"})
    public ResponseEntity<Groups> editGroup(
            @PathVariable Long groupId,
            @Validated @ModelAttribute("data") GroupRequest request,
            @RequestParam(value = "picture", required = false) MultipartFile picture) {
        // Gọi service để cập nhật nhóm và trả về kết quả
        Groups updatedGroup = groupService.updateGroup(groupId, request, picture);

        // Trả về nhóm đã được cập nhật
        return ResponseEntity.ok(updatedGroup);
    }


    @PostMapping("/{groupId}/kick")
    public ResponseEntity<String> kickMember(@PathVariable Long groupId, @RequestBody Map<String, Long> request) {
        Long memberId = request.get("memberId");
        groupService.kickMember(groupId, memberId);
        return ResponseEntity.ok("Thành viên đã bị loại khỏi nhóm.");
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<String> leaveGroup(@PathVariable Long groupId) {
        groupService.leaveGroup(groupId);
        return ResponseEntity.ok("Bạn đã rời khỏi nhóm.");
    }

    @PostMapping("/invite")
    public ResponseEntity<String> inviteMembers(@RequestBody GroupInviteRequest request) {
        groupService.inviteMembers(request);
        return ResponseEntity.ok("Lời mời đã được gửi đến các thành viên.");
    }

    @PostMapping("/search")
    public ResponseEntity<List<MemberSearchResponse>> searchMembers(@RequestBody MemberSearchRequest request) {
        return ResponseEntity.ok(groupService.searchMembers(request));
    }

    @PostMapping("/respond")
    public ResponseEntity<String> respondToInvitation(@RequestBody GroupMemberRequest dto) {
        groupService.respondToInvitation(dto.getGroupId(), dto.getStatus());
        String message = dto.getStatus() == GroupMemberStatus.ACCEPTED
                ? "Bạn đã chấp nhận lời mời."
                : "Bạn đã từ chối lời mời.";
        return ResponseEntity.ok(message);
    }

    @GetMapping("/invitations")
    public ResponseEntity<List<GroupInvitationDTO>> getPendingInvitations() {
        return ResponseEntity.ok(groupService.getPendingInvitations());
    }

    @DeleteMapping("/{groupId}/disband")
    public ResponseEntity<String> disbandGroup(@PathVariable Long groupId) {
        groupService.disbandGroup(groupId);
        return ResponseEntity.ok("Nhóm đã được giải tán.");
    }

    @GetMapping("/available-to-join")
    public ResponseEntity<List<AvailableGroupResponse>> getAvailableGroups() {
        return ResponseEntity.ok(groupService.getAvailableGroupsToJoinChallenge());
    }

    @GetMapping("/{groupId}/challenge-history")
    public ResponseEntity<Page<GroupChallengeHistoryDTO>> getGroupChallengeHistory(
            @PathVariable Long groupId,
            @RequestParam(required = false) GroupChallengeStatus status,
            @RequestParam(defaultValue = "0") int page
    ) {
        return ResponseEntity.ok(groupService.getGroupChallengeHistories(groupId, status, page));
    }

    @GetMapping("/{groupId}/ranking")
    public ResponseEntity<Page<GroupMemberRankingDTO>> getGroupMemberRanking(
            @PathVariable Long groupId,
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<GroupMemberRankingDTO> result = groupService.getGroupMemberRanking(groupId, keyword, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/my-groups")
    public ResponseEntity<Page<MyGroupResponse>> getMyGroups(
            @RequestParam(value = "keyword", required = false) String keyword,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(groupService.getMyGroups(keyword, pageable));
    }

}
