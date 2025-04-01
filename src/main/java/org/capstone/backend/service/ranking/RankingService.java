package org.capstone.backend.service.ranking;

import org.capstone.backend.dto.rank.ChallengeProgressRankingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RankingService {
    Page<ChallengeProgressRankingResponse> getPaginatedRankingByChallengeId(Long challengeId, Pageable pageable);

    // Scheduled job sẽ gọi để cập nhật toàn bộ bảng xếp hạng của tất cả thử thách
    void recalculateAllChallengeProgressRankings();
}
