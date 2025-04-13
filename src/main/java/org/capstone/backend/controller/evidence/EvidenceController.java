package org.capstone.backend.controller.evidence;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.evidence.EvidenceReviewRequest;
import org.capstone.backend.dto.evidence.EvidenceToReviewDTO;
import org.capstone.backend.dto.evidence.TaskChecklistDTO;
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
import java.util.Map;
@RestController
@RequestMapping("/api/evidences")
@RequiredArgsConstructor
public class EvidenceController {

    private final EvidenceService evidenceService;

    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadEvidence(
            @RequestParam("file") MultipartFile file,
            @RequestParam("data") Long challengeId) {

        try {
            evidenceService.uploadAndSubmitEvidence(file, challengeId);
            return ResponseEntity.ok(Map.of("message", "Nộp bằng chứng thành công!", "status", "PENDING"));
        } catch (ResponseStatusException e) {
            // Trả lại đúng status và lý do từ service
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("error", e.getReason()));
        } catch (Exception e) {
            // In rõ lỗi cho dev log, không che giấu lỗi
            e.printStackTrace(); // hoặc dùng logger.error(...)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Lỗi nội bộ trong khi xử lý.",
                            "details", e.getMessage()
                    ));
        }
    }


    @PostMapping("/review")
    public ResponseEntity<?> reviewEvidence(@RequestBody EvidenceReviewRequest request) {
        try {
            evidenceService.reviewEvidence(request);
            return ResponseEntity.ok("Đã chấm bằng chứng thành công.");
        } catch (ResponseStatusException ex) {
            // Bắt lỗi từ service ném lên (status + message cụ thể)
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(ex.getReason());
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
        evidenceService.assignPendingReviewersForChallenge(challengeId);
        List<EvidenceToReviewDTO> list = evidenceService.getEvidenceAssignedForMemberToReview(challengeId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{challengeId}/my-evidences")
    public ResponseEntity<List<EvidenceToReviewDTO>> getMySubmittedEvidencesPagedByChallenge(
            @PathVariable Long challengeId
    ) {
        List<EvidenceToReviewDTO> result = evidenceService.getMySubmittedEvidencesByChallenge(challengeId);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/tasks")
    public ResponseEntity<List<TaskChecklistDTO>> getTasksForCurrentMonth(
           ) {

        List<TaskChecklistDTO> tasks = evidenceService.getTasksForCurrentMonth();
        return ResponseEntity.ok(tasks);
    }

}
