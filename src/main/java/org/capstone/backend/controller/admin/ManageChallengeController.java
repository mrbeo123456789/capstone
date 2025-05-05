package org.capstone.backend.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.dto.evidence.EvidenceToReviewDTO;
import org.capstone.backend.service.challenge.ChallengeService;
import org.capstone.backend.service.evidence.EvidenceService;
import org.capstone.backend.utils.enums.ChallengeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/challenges")
@RequiredArgsConstructor
public class ManageChallengeController {

    private final ChallengeService challengeService;

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
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminChallengesResponse> challenges = challengeService.getChallenges(name, status, page, size);
        return ResponseEntity.ok(challenges);
    }

    @GetMapping("/summary")
    public ResponseEntity<AdminDashboardSummaryDTO> getAdminDashboardSummary() {
        return ResponseEntity.ok(challengeService.getAdminDashboardSummary());
    }
    @GetMapping("/get_created_challenge")
    public ResponseEntity<Page<ChallengeDashboardDTO>> getCreatedChallenges(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ChallengeStatus status,
            @PageableDefault(size = 10, sort = "name") Pageable pageable
    ) {

        return ResponseEntity.ok(challengeService.getAdminChallengeTable(keyword, status, pageable));
    }
    @GetMapping("/member-participation")
    public ResponseEntity<List<ChallengeParticipationChartDTO>> getMemberParticipationChart() {
        return ResponseEntity.ok(challengeService.getAdminChallengeParticipationChart());
    }

}
