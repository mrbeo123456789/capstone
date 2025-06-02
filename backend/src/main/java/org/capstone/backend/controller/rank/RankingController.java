package org.capstone.backend.controller.rank;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.rank.*;
import org.capstone.backend.entity.GlobalGroupRanking;
import org.capstone.backend.entity.GlobalMemberRanking;
import org.capstone.backend.service.ranking.RankingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
    @GetMapping("{challengeId}/group-top3-progress")
    public ResponseEntity<List<GroupProgressRankingDTO>> getTop3GroupProgress(@PathVariable Long challengeId) {
        return ResponseEntity.ok(rankingService.getTop3GroupProgress(challengeId));
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

    // Controller update
    @GetMapping("/global")
    public Page<GlobalMemberRankingResponse> getGlobalRanking(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return rankingService.getGlobalRanking(pageable, keyword);
    }

    @GetMapping("/global/me")
    public GlobalMemberRankingResponse getMyRanking() {
        return rankingService.getCurrentUserRanking();
    }
    @GetMapping("/{challengeId}/group-star-ratings")
    public ResponseEntity<Page<GroupStarRatingProjection>> getGroupStarRatingsByChallenge(
            @PathVariable Long challengeId,
            @PageableDefault(size = 10) Pageable pageable) {

        // Gọi service đã dùng native query và convert projection -> DTO
        Page<GroupStarRatingProjection> response = rankingService.getGroupStarRatingsByChallengeId(challengeId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ranking/groups/global")
    public ResponseEntity<Page<GlobalGroupRankingDto>> getGlobalGroupRanking(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "totalStars", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(rankingService.getGlobalGroupRanking(pageable, keyword));
    }

}
