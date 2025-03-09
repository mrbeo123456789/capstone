package org.capstone.backend.repository;

import org.capstone.backend.entity.GroupInvitation;
import org.capstone.backend.entity.Groups;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface GroupInvitationRepository extends JpaRepository<GroupInvitation, Long> {

    Optional<GroupInvitation> findByInviteLink(String inviteLink);
    Optional<GroupInvitation> findByGroupIdAndExpiresAtAfter(Long groupId, LocalDateTime now);
}
