package org.capstone.backend.controller.challenge;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.dto.report.ChallengeReportRequestDTO;

import org.capstone.backend.entity.ChallengeType;
import org.capstone.backend.service.challenge.ChallengeService;
import org.capstone.backend.service.report.ChallengeReportService;
import org.capstone.backend.utils.enums.ChallengeRole;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;
    private final ChallengeReportService challengeReportService;


    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public ResponseEntity<?> createChallenge(
            @Validated @ModelAttribute("data") ChallengeRequest request,
            @RequestParam(value = "picture", required = false) MultipartFile picture,
            @RequestParam(value = "banner", required = false) MultipartFile banner
    ) {
        try {
            String resultMessage = challengeService.createChallenge(request, picture, banner);
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
    public ResponseEntity<?> getMyChallenges(@RequestBody String request) {
        try {
            System.out.println("Received role: " + request); // Debug request
            ChallengeRole role = null;

            if (!"ALL".equalsIgnoreCase(request.trim())) {
                role = ChallengeRole.valueOf(request.toUpperCase().trim());
            }

            List<MyChallengeResponse> challenges = challengeService.getChallengesByMember(role);
            return ResponseEntity.ok(challenges);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid role: " + request);
        }
    }

    @GetMapping("/{challengeId}/detail")
    public ResponseEntity<ChallengeDetailResponse> getChallengeDetail(@PathVariable Long challengeId) {
        ChallengeDetailResponse detail = challengeService.getChallengeDetail(challengeId);
        return ResponseEntity.ok(detail);
    }
    @PostMapping("/report")
    public ResponseEntity<?> reportChallenge(@RequestBody ChallengeReportRequestDTO dto) {
        challengeReportService.reportChallenge(dto);
        return ResponseEntity.ok("Report submitted successfully.");
    }
    @PostMapping("/{groupId}/join-challenge/{challengeId}")
    public ResponseEntity<String> joinGroupToChallenge(
            @PathVariable Long groupId,
            @PathVariable Long challengeId) {
        String result = challengeService.joinGroupToChallenge(groupId, challengeId);
        return ResponseEntity.ok(result);
    }
    // Endpoint cho việc rời thử thách
    @PostMapping("/{challengeId}/leave")
    public ResponseEntity<String> leaveChallenge(@PathVariable Long challengeId) {
        String response = challengeService.leaveChallenge(challengeId);
        return ResponseEntity.ok(response);
    }

    // Endpoint cho việc huỷ thử thách
    @PostMapping("/{challengeId}/cancel")
    public ResponseEntity<String> cancelChallenge(@PathVariable Long challengeId) {
        String response = challengeService.cancelChallenge(challengeId);
        return ResponseEntity.ok(response);
    }

    // Endpoint cho việc kick (loại) thành viên khỏi thử thách
    @DeleteMapping("/{challengeId}/kick/{targetMemberId}")
    public ResponseEntity<String> kickMemberFromChallenge(@PathVariable Long challengeId,
                                                          @PathVariable Long targetMemberId) {
        String response = challengeService.kickMemberFromChallenge(challengeId, targetMemberId);
        return ResponseEntity.ok(response);
    }
}
