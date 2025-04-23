package org.capstone.backend.controller.challenge;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.dto.member.MemberSubmissionProjection;
import org.capstone.backend.dto.report.ChallengeReportRequestDTO;
import org.capstone.backend.entity.ChallengeType;
import org.capstone.backend.service.challenge.ChallengeService;
import org.capstone.backend.service.report.ChallengeReportService;
import org.capstone.backend.utils.enums.ChallengeRole;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;
    private final ChallengeReportService challengeReportService;

    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public ResponseEntity<String> createChallenge(
            @Validated @ModelAttribute("data") ChallengeRequest request,
            @RequestParam(value = "picture", required = false) MultipartFile picture,
            @RequestParam(value = "banner", required = false) MultipartFile banner
    ) {
        String resultMessage = challengeService.createChallenge(request, picture, banner);
        return ResponseEntity.ok(resultMessage);
    }

    @GetMapping("/challenge-types")
    public ResponseEntity<List<ChallengeType>> getAllChallengeTypes() {
        List<ChallengeType> types = challengeService.getAllTypes();
        return ResponseEntity.ok(types);
    }

    @PostMapping("/join")
    public ResponseEntity<String> joinChallenge(@RequestBody Long challengeId) {
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
    public ResponseEntity<String> toggleCoHost(@PathVariable Long challengeId, @PathVariable Long memberId) {
        challengeService.toggleCoHost(challengeId, memberId);
        return ResponseEntity.ok("Cập nhật quyền Co-Host thành công!");
    }

    @PostMapping("/my-challenges")
    public ResponseEntity<List<MyChallengeResponse>> getMyChallenges(@RequestBody String request) {
        ChallengeRole role = null;
        if (!"ALL".equalsIgnoreCase(request.trim())) {
            role = ChallengeRole.valueOf(request.toUpperCase().trim());
        }
        List<MyChallengeResponse> challenges = challengeService.getChallengesByMember(role);
        return ResponseEntity.ok(challenges);
    }

    @GetMapping("/{challengeId}/detail")
    public ResponseEntity<ChallengeDetailResponse> getChallengeDetail(@PathVariable Long challengeId) {
        ChallengeDetailResponse detail = challengeService.getChallengeDetail(challengeId);
        return ResponseEntity.ok(detail);
    }

    @PostMapping("/report")
    public ResponseEntity<String> reportChallenge(@RequestBody ChallengeReportRequestDTO dto) {
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

    @PostMapping("/{challengeId}/leave")
    public ResponseEntity<String> leaveChallenge(@PathVariable Long challengeId) {
        String response = challengeService.leaveChallenge(challengeId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{challengeId}/cancel")
    public ResponseEntity<String> cancelChallenge(@PathVariable Long challengeId) {
        String response = challengeService.cancelChallenge(challengeId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{challengeId}/kick/{targetMemberId}")
    public ResponseEntity<String> kickMemberFromChallenge(@PathVariable Long challengeId,
                                                          @PathVariable Long targetMemberId) {
        String response = challengeService.kickMemberFromChallenge(challengeId, targetMemberId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{challengeId}/members")
    public ResponseEntity<Page<MemberSubmissionProjection>> getJoinedMembersWithPendingEvidence(
            @PathVariable Long challengeId,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<MemberSubmissionProjection> result = challengeService
                .getJoinedMembersWithPendingEvidence(challengeId, keyword, page, size);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/public/upcoming")
    public ResponseEntity<Page<ChallengeResponse>> getUpcomingApprovedChallenges(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ChallengeResponse> upcomingChallenges = challengeService.getUpcomingApprovedChallenges(page, size);
        return ResponseEntity.ok(upcomingChallenges);
    }

    @PutMapping(value = "/{challengeId}/update", consumes = {"multipart/form-data"})
    public ResponseEntity<String> updateChallenge(
            @PathVariable Long challengeId,
            @Validated @ModelAttribute ChallengeRequest request,
            @RequestParam(value = "picture", required = false) MultipartFile picture,
            @RequestParam(value = "banner", required = false) MultipartFile banner,
            @RequestParam(value = "pictureUrl", required = false) String pictureUrl,
            @RequestParam(value = "bannerUrl", required = false) String bannerUrl
    ) {
        String resultMessage = challengeService.updateChallenge(
                challengeId,
                request,
                picture,
                banner,
                pictureUrl,
                bannerUrl
        );
        return ResponseEntity.ok(resultMessage);
    }

    @GetMapping("/completed")
    public ResponseEntity<List<ChallengeSummaryDTO>> getCompletedChallengesForCurrentMember() {
        return ResponseEntity.ok(challengeService.getCompletedChallenges());
    }

    @GetMapping("/{challengeId}/statistics")
    public ResponseEntity<ChallengeStatisticDTO> getChallengeStatistics(@PathVariable Long challengeId) {
        return ResponseEntity.ok(challengeService.getChallengeStatistics(challengeId));
    }

}
