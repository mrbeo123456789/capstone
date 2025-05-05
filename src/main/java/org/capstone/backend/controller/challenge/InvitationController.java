package org.capstone.backend.controller.challenge;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.dto.group.MemberSearchRequest;
import org.capstone.backend.dto.group.MemberSearchResponse;
import org.capstone.backend.service.challenge.InvitationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/member/invitations")
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping("/send/personal")
    public ResponseEntity<String> sendInvitation(@RequestBody @Valid InviteMemberRequest request) {
        String response = invitationService.sendInvitation(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/respond")
    public ResponseEntity<String> respondToInvitation(@RequestBody @Valid InvitationRespondRequestDTO request) {
        String response = invitationService.respondToInvitation(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/member")
    public ResponseEntity<List<InvitationResponseDTO>> getInvitationsForMember() {
        List<InvitationResponseDTO> invitations = invitationService.getInvitationsForMember();
        return ResponseEntity.ok(invitations);
    }

    @PostMapping("/search")
    public ResponseEntity<List<MemberSearchResponse>> searchMembers(@RequestBody @Valid ChallengeSearchRequest keyword) {
        List<MemberSearchResponse> members = invitationService.searchMembersForChallengeInvite(keyword);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/suggest/{challengeId}")
    public ResponseEntity<List<MemberSearchResponse>> getSuggestion(@PathVariable("challengeId") Long challengeId) {
        List<MemberSearchResponse> suggestions = invitationService.suggestMembers(challengeId);
        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/send/group")
    public ResponseEntity<String> inviteGroupToChallenge(@RequestBody @Valid InviteGroupToChallengeRequest request) {
        String responseMessage = invitationService.sendGroupInvitationToChallenge(request);
        return ResponseEntity.ok(responseMessage);
    }

    @GetMapping("/{challengeId}/search-leaders")
    public ResponseEntity<List<MemberSearchResponse>> searchAvailableGroupLeaders(
            @PathVariable Long challengeId,
            @Valid MemberSearchRequest request
    ) {
        List<MemberSearchResponse> leaders = invitationService.searchAvailableGroupLeaders(challengeId, request.getKeyword());
        return ResponseEntity.ok(leaders);
    }
}
