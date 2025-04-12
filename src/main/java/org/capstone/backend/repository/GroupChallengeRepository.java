package org.capstone.backend.repository;

import org.capstone.backend.dto.challenge.GroupChallengeHistoryDTO;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.entity.GroupChallenge;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.utils.enums.GroupChallengeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupChallengeRepository extends JpaRepository<GroupChallenge, Long> {

    // Kiểm tra xem một group đã có tham gia thử thách nào với trạng thái đang diễn ra (ONGOING) hay chưa
    boolean existsByGroupAndStatus(Groups group, GroupChallengeStatus status);
    List<GroupChallenge> findByGroupAndStatus(Groups group, GroupChallengeStatus status);
    @Query("SELECT gc.id AS groupChallengeId, " +
            "c.name AS challengeName, " +
            "c.picture AS challengePicture, " +
            "gc.status AS status, " +
            "gc.isSuccess AS isSuccess, " +
            "gc.joinDate AS joinDate " +
            "FROM GroupChallenge gc JOIN gc.challenge c " +
            "WHERE gc.group.id = :groupId " +
            "AND (:status IS NULL OR gc.status = :status) " +
            "ORDER BY " +
            "CASE WHEN gc.status = 'ONGOING' THEN 0 ELSE 1 END ASC, " +
            "gc.joinDate DESC")
    Page<GroupChallengeHistoryDTO> findGroupChallengeHistories(
            @Param("groupId") Long groupId,
            @Param("status") GroupChallengeStatus status,
            Pageable pageable
    );

}
