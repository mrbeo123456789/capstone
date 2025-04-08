package org.capstone.backend.service.interest;

import org.capstone.backend.dto.interest.InterestDTO;
import org.capstone.backend.entity.Interest;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface InterestService {
    Map<String, List<InterestDTO>> getInterestsForAuthenticatedMember();
    void updateMemberInterests(List<Long> interestIds);
    Page<Interest> findAllPaged(String keyword, int page, int size);
    Interest create(Interest interest);
    Interest update(Long id, Interest updated);
    void delete(Long id);

}
