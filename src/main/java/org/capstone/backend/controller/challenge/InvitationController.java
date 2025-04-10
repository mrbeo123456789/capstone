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
    public ResponseEntity<String> respondToInvitation(
            @RequestBody @Valid InvitationRespondRequestDTO request) {
        String response = invitationService.respondToInvitation(request);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/member")
    public ResponseEntity<List<InvitationResponseDTO>> getInvitationsForMember() {
        List<InvitationResponseDTO> invitations = invitationService.getInvitationsForMember();
        return ResponseEntity.ok(invitations);
    }

    @PostMapping("/search")
    public List<MemberSearchResponse> searchMembers(@RequestBody ChallengeSearchRequest keyword) {
        return invitationService.searchMembersForChallengeInvite(keyword);
    }

    @GetMapping("/suggest/{challengeId}")
    public List<MemberSearchResponse> getSuggestion(@PathVariable("challengeId") Long challengeId) {
        return invitationService.suggestMembers(challengeId);
    }

    @PostMapping("/send/group")
    public ResponseEntity<String> inviteGroupToChallenge(@Valid @RequestBody InviteGroupToChallengeRequest request) {
        String responseMessage = invitationService.sendGroupInvitationToChallenge(request);
        return ResponseEntity.ok(responseMessage);
    }

    @GetMapping("/{challengeId}/search-leaders")
    public List<MemberSearchResponse> searchAvailableGroupLeaders(
            @PathVariable Long challengeId,
            @Valid MemberSearchRequest request
    ) {
        return invitationService.searchAvailableGroupLeaders(challengeId, request.getKeyword());
    }
}
