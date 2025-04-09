package org.capstone.backend.controller.challenge;

import jakarta.validation.Valid;
import org.capstone.backend.dto.challenge.ChallengeSearchRequest;
import org.capstone.backend.dto.challenge.InvitationResponseDTO;
import org.capstone.backend.dto.challenge.InviteGroupToChallengeRequest;
import org.capstone.backend.dto.challenge.InviteMemberRequest;
import org.capstone.backend.dto.group.MemberSearchRequest;
import org.capstone.backend.dto.group.MemberSearchResponse;
import org.capstone.backend.service.challenge.InvitationService;
import org.capstone.backend.service.group.GroupService;
import org.capstone.backend.service.member.MemberService;
import org.capstone.backend.utils.suggestion.MemberSuggestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/member/invitations")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

        @PostMapping("/send/personal")
        public ResponseEntity<String> sendInvitation(@RequestBody InviteMemberRequest request) {
            String response = invitationService.sendInvitation(request);
            return ResponseEntity.ok(response);
        }

    @PostMapping("/respond/{invitationId}")
    public ResponseEntity<String> respondToInvitation(@PathVariable Long invitationId, @RequestParam boolean accept) {
        String response = invitationService.respondToInvitation(invitationId, accept);
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
}
