package org.capstone.backend.controller.challenge;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.entity.Challenge;

import org.capstone.backend.entity.ChallengeType;
import org.capstone.backend.service.challenge.ChallengeService;
import org.capstone.backend.service.challenge.InvitationService;
import org.capstone.backend.utils.enums.ChallengeRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {
    @Autowired
    private ChallengeService challengeService;


    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public ResponseEntity<?> createChallenge(
            @Validated @ModelAttribute("data") ChallengeRequest request,
            @RequestParam(value = "picture", required = false) MultipartFile picture,
            @RequestParam(value = "banner", required = false) MultipartFile banner
    ) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() ||
                    "anonymousUser".equals(authentication.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User is not authenticated");
            }

            String username = authentication.getName();
            String resultMessage = challengeService.createChallenge(request, picture, banner, username);
            return ResponseEntity.ok(resultMessage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating challenge: " + e.getMessage());
        }
    }

    @GetMapping("/challenge-types")
    public List<ChallengeType> getAllChallengeTypes() {
        return challengeService.getAllTypes();
    }

    @PostMapping("/join")
    public ResponseEntity<String> joinChallenge( @RequestBody Long challengeId) {
        String result = challengeService.joinChallenge(challengeId);
        return ResponseEntity.ok(result);
    }


    @GetMapping("/approved")
    public ResponseEntity<Page<ChallengeResponse>> getApprovedChallenges(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ChallengeResponse> challenges = challengeService.getApprovedChallenges(page, size);
        return ResponseEntity.ok(challenges);
    }
    @PutMapping("/{challengeId}/change-roles/{memberId}")
    public ResponseEntity<?> toggleCoHost(@PathVariable Long challengeId, @PathVariable Long memberId) {
        challengeService.toggleCoHost(challengeId, memberId);
        return ResponseEntity.ok("Cập nhật quyền Co-Host thành công!");
    }

    @PostMapping("/my-challenges")
    public ResponseEntity<List<MyChallengeResponse>> getMyChallenges(@RequestBody ChallengeRole request) {
        List<MyChallengeResponse> challenges = challengeService.getChallengesByMember(request);
        return ResponseEntity.ok(challenges);
    }
    @GetMapping("/{challengeId}/detail")
    public ResponseEntity<ChallengeDetailResponse> getChallengeDetail(@PathVariable Long challengeId) {
        ChallengeDetailResponse detail = challengeService.getChallengeDetail(challengeId);
        return ResponseEntity.ok(detail);
    }
}
