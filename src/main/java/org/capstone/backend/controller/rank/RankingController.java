package org.capstone.backend.controller.rank;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.rank.ChallengeProgressRankingResponse;
import org.capstone.backend.dto.rank.ChallengeStarRatingResponse;
import org.capstone.backend.entity.GlobalMemberRanking;
import org.capstone.backend.service.ranking.RankingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @GetMapping("/progress/{challengeId}")
    public ResponseEntity<List<ChallengeProgressRankingResponse>> getTop3Ranking(@PathVariable Long challengeId) {
        List<ChallengeProgressRankingResponse> top3 = rankingService.getTop3RankingByChallengeId(challengeId);
        return ResponseEntity.ok(top3);
    }
    @GetMapping("/challenges/{challengeId}/stars")
    public ResponseEntity<Page<ChallengeStarRatingResponse>> getStarLeaderboard(
            @PathVariable Long challengeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(
                Sort.Order.desc("averageStar"),
                Sort.Order.desc("totalRatingCount"),
                Sort.Order.desc("givenRatingCount")
        ));

        Page<ChallengeStarRatingResponse> starRatings = rankingService.getStarRatingsByChallengeId(challengeId, pageable);
        return ResponseEntity.ok(starRatings);
    }

    @GetMapping("/global")
    public Page<GlobalMemberRanking> getGlobalRanking(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return rankingService.getGlobalRanking(pageable);
    }
}
