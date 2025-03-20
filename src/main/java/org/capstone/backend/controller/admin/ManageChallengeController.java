package org.capstone.backend.controller.admin;

import jakarta.validation.Valid;
import org.capstone.backend.dto.challenge.AdminChallengesResponse;
import org.capstone.backend.dto.challenge.ReviewChallengeRequest;
import org.capstone.backend.service.challenge.ChallengeService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/challenges")
public class ManageChallengeController {
    private final ChallengeService challengeService;
    public ManageChallengeController(final ChallengeService challengeService) {
        this.challengeService = challengeService;
    }
    @PostMapping("/review")
    public ResponseEntity<String> reviewChallenge(@Valid @RequestBody ReviewChallengeRequest request) {
        String result = challengeService.reviewChallenge(request);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/all")
    public ResponseEntity<Page<AdminChallengesResponse>> getChallenges(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AdminChallengesResponse> challenges = challengeService.getChallenges(page, size);
        return ResponseEntity.ok(challenges);
    }

}
