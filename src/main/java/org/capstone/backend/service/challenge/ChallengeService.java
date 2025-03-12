package org.capstone.backend.service.challenge;

import org.capstone.backend.dto.challenge.ChallengeRequest;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeType;
import org.capstone.backend.utils.enums.ChallengeStatus;

import java.util.List;

public interface ChallengeService {
    Challenge createChallenge(ChallengeRequest request, String username);
    List<ChallengeType> getAllTypes();
    Challenge reviewChallenge(Long challengeId, ChallengeStatus status, String adminNote);
}
