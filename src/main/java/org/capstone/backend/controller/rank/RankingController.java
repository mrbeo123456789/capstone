package org.capstone.backend.controller.rank;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.rank.ChallengeProgressRankingResponse;
import org.capstone.backend.service.ranking.RankingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @GetMapping("/progress/{challengeId}")
    public ResponseEntity<Page<ChallengeProgressRankingResponse>> getProgressRanking(
            @PathVariable Long challengeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("score").descending());
        Page<ChallengeProgressRankingResponse> rankings =
                rankingService.getPaginatedRankingByChallengeId(challengeId, pageable);
        return ResponseEntity.ok(rankings);
    }

}
