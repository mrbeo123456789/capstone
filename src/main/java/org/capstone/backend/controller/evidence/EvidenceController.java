package org.capstone.backend.controller.evidence;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.evidence.EvidenceReviewRequest;
import org.capstone.backend.dto.evidence.EvidenceToReviewDTO;
import org.capstone.backend.dto.member.UserProfileRequest;
import org.capstone.backend.entity.Evidence;
import org.capstone.backend.service.evidence.EvidenceService;
import org.capstone.backend.service.member.MemberService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/member/evidences")
@RequiredArgsConstructor
public class EvidenceController {

    private final EvidenceService evidenceService;

    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadEvidence(@RequestParam("file") MultipartFile file,
                                            @ModelAttribute("data") Long challengeId
                                            ) {

        try {
            Evidence saved = evidenceService.uploadAndSubmitEvidence(file, challengeId);
            return ResponseEntity.ok(saved);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi xử lý bằng chứng.");
        }
    }
    @PostMapping("/review")
    public ResponseEntity<?> reviewEvidence(@RequestBody EvidenceReviewRequest request
                                        ) {

        try {
            evidenceService.reviewEvidence(request);
            return ResponseEntity.ok("Đã chấm bằng chứng thành công.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi chấm bằng chứng.");
        }
    }
    @GetMapping("/get-list-for-host/{challengeId}")
    public ResponseEntity<Page<EvidenceToReviewDTO>> getEvidenceByChallengePaged(
            @PathVariable Long challengeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<EvidenceToReviewDTO> evidences = evidenceService.getEvidenceByChallengeForHost(challengeId, page, size);
        return ResponseEntity.ok(evidences);
    }
    @GetMapping("/{challengeId}/to-review")
    public ResponseEntity<List<EvidenceToReviewDTO>> getEvidencesAssignedForReviewByChallenge(
            @PathVariable Long challengeId
    ) {
        List<EvidenceToReviewDTO> list = evidenceService.getEvidenceAssignedForMemberToReview(challengeId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{challengeId}/my-evidences")
    public ResponseEntity<Page<EvidenceToReviewDTO>> getMySubmittedEvidencesPagedByChallenge(
            @PathVariable Long challengeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<EvidenceToReviewDTO> result = evidenceService.getMySubmittedEvidencesPagedByChallenge(challengeId, page, size);
        return ResponseEntity.ok(result);
    }


}
