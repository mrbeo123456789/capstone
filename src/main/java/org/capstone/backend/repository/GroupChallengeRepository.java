package org.capstone.backend.repository;

import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.entity.GroupChallenge;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.utils.enums.GroupChallengeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupChallengeRepository extends JpaRepository<GroupChallenge, Long> {

    // Kiểm tra xem một group đã có tham gia thử thách nào với trạng thái đang diễn ra (ONGOING) hay chưa
    boolean existsByGroupAndStatus(Groups group, GroupChallengeStatus status);

    // Tìm một bản ghi GroupChallenge dựa trên Group và Challenge
    Optional<GroupChallenge> findByGroupAndChallenge(Groups group, Challenge challenge);
}
