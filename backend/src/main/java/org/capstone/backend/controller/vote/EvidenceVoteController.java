package org.capstone.backend.controller.vote;

import lombok.RequiredArgsConstructor;

import org.capstone.backend.dto.evidence.EvidenceVoteHistoryResponse;
import org.capstone.backend.dto.vote.EvidenceVoteRequest;
import org.capstone.backend.dto.vote.EvidenceVoteResponse;
import org.capstone.backend.entity.Evidence;
import org.capstone.backend.entity.EvidenceVote;
import org.capstone.backend.service.vote.EvidenceVoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evidence-votes")
@RequiredArgsConstructor
public class EvidenceVoteController {

    private final EvidenceVoteService evidenceVoteService;

    // ✅ Vote evidence
    @PostMapping("/{evidenceId}")
    public ResponseEntity<String> voteEvidence(
            @PathVariable Long evidenceId,
            @RequestBody EvidenceVoteRequest request
    ) {
        String message = evidenceVoteService.voteEvidence(evidenceId, request);
        return ResponseEntity.ok(message);
    }
    @GetMapping("/tasks/{challengeId}")
    public ResponseEntity<List<EvidenceVoteResponse>> getEvidenceToVoteByChallenge(
            @PathVariable Long challengeId
    ) {
        return ResponseEntity.ok(evidenceVoteService.getEvidenceToVoteByChallenge(challengeId));
    }

    @GetMapping("/history/{challengeId}")
    public ResponseEntity<List<EvidenceVoteResponse>> getVoteHistoryForChallenge(
            @PathVariable Long challengeId
    ) {
        List<EvidenceVoteResponse> history = evidenceVoteService.getVoteHistoryForChallenge(challengeId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/my-votes")
    public ResponseEntity<List<EvidenceVoteHistoryResponse>> getMyVotedEvidence(
            @RequestParam(required = false) Long challengeId
    ) {
        return ResponseEntity.ok(evidenceVoteService.getMyVotedEvidence(challengeId));
    }



}
