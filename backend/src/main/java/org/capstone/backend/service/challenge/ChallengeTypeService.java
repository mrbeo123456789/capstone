package org.capstone.backend.service.challenge;

import org.capstone.backend.entity.ChallengeType;
import org.springframework.data.domain.Page;

public interface ChallengeTypeService {
    Page<ChallengeType> findAllPaged(String keyword, int page, int size);
    ChallengeType create(ChallengeType challengeType);
    ChallengeType update(Long id, ChallengeType updated);
    void delete(Long id);
}
