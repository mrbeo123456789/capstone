package org.capstone.backend.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.challenge.AdminChallengesResponse;
import org.capstone.backend.dto.challenge.ReviewChallengeRequest;
import org.capstone.backend.dto.evidence.EvidenceToReviewDTO;
import org.capstone.backend.service.challenge.ChallengeService;
import org.capstone.backend.service.evidence.EvidenceService;
import org.capstone.backend.utils.enums.ChallengeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/challenges")
public class ManageChallengeController {
    private final ChallengeService challengeService;
    private final EvidenceService evidenceService;
    @PostMapping("/review")
    public ResponseEntity<String> reviewChallenge(@Valid @RequestBody ReviewChallengeRequest request) {
        String result = challengeService.reviewChallenge(request);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/all")
    public ResponseEntity<Page<AdminChallengesResponse>> getChallenges(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        ChallengeStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = ChallengeStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().build(); // hoặc trả về message rõ hơn
            }
        }

        Page<AdminChallengesResponse> challenges = challengeService.getChallenges(name, statusEnum, page, size);
        return ResponseEntity.ok(challenges);
    }

    @GetMapping("/getEvidence")
    public Page<EvidenceToReviewDTO> getEvidencesByMemberAndChallenge(
            @RequestParam Long memberId,
            @RequestParam Long challengeId,
            @RequestParam(defaultValue = "0") int page
    ) {
        // Page size = 10 như bạn yêu cầu
        PageRequest pageable = PageRequest.of(page, 10);
        return evidenceService.getEvidenceByMemberAndChallenge(memberId, challengeId, pageable);
    }


}
