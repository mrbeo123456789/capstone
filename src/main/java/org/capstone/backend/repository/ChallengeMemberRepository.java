package org.capstone.backend.repository;

import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeMember;
import org.capstone.backend.entity.Member;
import org.capstone.backend.utils.enums.ChallengeMemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChallengeMemberRepository extends JpaRepository<ChallengeMember, Long> {
    List<ChallengeMember> findByMemberAndStatus(Member member, ChallengeMemberStatus status);
    Optional<ChallengeMember> findByMemberAndChallenge(Member member, Challenge challenge);
    int countByChallengeAndStatus(Challenge challenge, ChallengeMemberStatus status);

}
