package org.capstone.backend.service.interest;

import org.capstone.backend.dto.interest.InterestDTO;

import java.util.List;
import java.util.Map;

public interface InterestService {
    Map<String, List<InterestDTO>> getInterestsForAuthenticatedMember();
    void updateMemberInterests(List<Long> interestIds);
}
