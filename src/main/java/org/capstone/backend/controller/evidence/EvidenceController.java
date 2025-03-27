package org.capstone.backend.controller.evidence;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.member.UserProfileRequest;
import org.capstone.backend.entity.Evidence;
import org.capstone.backend.service.evidence.EvidenceService;
import org.capstone.backend.service.member.MemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

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
}
