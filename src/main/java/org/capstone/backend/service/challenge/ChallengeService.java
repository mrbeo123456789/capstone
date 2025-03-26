package org.capstone.backend.service.challenge;

import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeType;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ChallengeService {
    String createChallenge(ChallengeRequest request, MultipartFile picture, MultipartFile banner, String username);
    List<ChallengeType> getAllTypes();
    String reviewChallenge(ReviewChallengeRequest request);
    String joinChallenge(Long challengeId);
    Page<AdminChallengesResponse> getChallenges(int page, int size);
    Page<ChallengeResponse> getApprovedChallenges(int page, int size);
}
