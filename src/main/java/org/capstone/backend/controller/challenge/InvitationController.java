package org.capstone.backend.controller.challenge;

import org.capstone.backend.dto.challenge.InvitationResponseDTO;
import org.capstone.backend.dto.challenge.InviteMemberRequest;
import org.capstone.backend.service.challenge.InvitationService;
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

        @PostMapping("/send")
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
}
