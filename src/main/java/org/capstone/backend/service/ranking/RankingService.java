package org.capstone.backend.service.ranking;

import org.capstone.backend.dto.rank.*;
import org.capstone.backend.entity.ChallengeStarRating;
import org.capstone.backend.entity.GlobalGroupRanking;
import org.capstone.backend.entity.GlobalMemberRanking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface RankingService {
    List<ChallengeProgressRankingResponse> getTop3RankingByChallengeId(Long challengeId);
    Page<ChallengeStarRatingResponse> getStarRatingsByChallengeId(Long challengeId, Pageable pageable);
    Page<GlobalMemberRankingResponse> getGlobalRanking(Pageable pageable, String keyword)    ;
    void updateGlobalRanking();
    void recalculateAllChallengeProgressRankings();
    void updateChallengeStarRatings();
    GlobalMemberRankingResponse getCurrentUserRanking();
    List<GroupProgressRankingDTO> getTop3GroupProgress(Long challengeId);
    Page<GroupStarRatingResponse> getGroupStarRatingsByChallengeId(Long challengeId, Pageable pageable);
    void calculateAndSaveGlobalGroupRanking(); // ✅ dùng cho schedule
    Page<GlobalGroupRanking> getGlobalGroupRanking(Pageable pageable, String keyword);
}
