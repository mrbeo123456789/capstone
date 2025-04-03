package org.capstone.backend.service.ranking;

import org.capstone.backend.dto.rank.ChallengeProgressRankingResponse;
import org.capstone.backend.dto.rank.ChallengeStarRatingResponse;
import org.capstone.backend.entity.ChallengeStarRating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface RankingService {
    List<ChallengeProgressRankingResponse> getTop3RankingByChallengeId(Long challengeId);
    Page<ChallengeStarRatingResponse> getStarRatingsByChallengeId(Long challengeId, Pageable pageable);

    // Scheduled job sẽ gọi để cập nhật toàn bộ bảng xếp hạng của tất cả thử thách
    void recalculateAllChallengeProgressRankings();
    void updateChallengeStarRatings();
}
