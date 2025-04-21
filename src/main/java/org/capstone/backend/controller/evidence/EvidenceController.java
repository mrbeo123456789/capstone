package org.capstone.backend.controller.evidence;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.evidence.EvidenceReviewRequest;
import org.capstone.backend.dto.evidence.EvidenceStatusCountDTO;
import org.capstone.backend.dto.evidence.EvidenceToReviewDTO;
import org.capstone.backend.dto.evidence.TaskChecklistDTO;
import org.capstone.backend.service.evidence.EvidenceService;
import org.capstone.backend.utils.enums.EvidenceStatus;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evidences")
@RequiredArgsConstructor
public class EvidenceController {

    private final EvidenceService evidenceService;

    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<Map<String, Object>> uploadEvidence(
            @RequestParam("file") MultipartFile file,
            @RequestParam("data") Long challengeId) {
        evidenceService.uploadAndSubmitEvidence(file, challengeId);
        return ResponseEntity.ok(Map.of(
                "message", "Nộp bằng chứng thành công!",
                "status", "PENDING"
        ));
    }

    @PostMapping("/review")
    public ResponseEntity<String> reviewEvidence(@RequestBody EvidenceReviewRequest request) {
        evidenceService.reviewEvidence(request);
        return ResponseEntity.ok("Đã chấm bằng chứng thành công.");
    }

    @GetMapping("/host/evidences")
    public ResponseEntity<Page<EvidenceToReviewDTO>> getEvidencesForHost(
            @RequestParam Long challengeId,
            @RequestParam(required = false) Long memberId,
            @RequestParam(required = false) EvidenceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<EvidenceToReviewDTO> evidences = evidenceService.getEvidenceByChallengeForHost(
                challengeId, memberId, status, page, size
        );
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
    public ResponseEntity<List<TaskChecklistDTO>> getTasksForDate(
            @RequestParam(value = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (date == null) {
            date = LocalDate.now();
        }

        List<TaskChecklistDTO> tasks = evidenceService.getTasksForDate(date);
        return ResponseEntity.ok(tasks);
    }


    @GetMapping("/count")
    public ResponseEntity<List<EvidenceStatusCountDTO>> getEvidenceCountByStatus(
            @RequestParam Long challengeId,
            @RequestParam Long memberId
    ) {
        // Gọi service để lấy kết quả
        List<EvidenceStatusCountDTO> result = evidenceService.countEvidenceByStatusForHost(
                challengeId, memberId
        );

        // Trả về kết quả dưới dạng ResponseEntity
        return ResponseEntity.ok(result);
    }
}
