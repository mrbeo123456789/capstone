package org.capstone.backend.dto.member;

import java.time.LocalDate;

public interface MemberStatisticDTO {
    Long getMemberId();
    String getFullName();
    String getAvatar();
    LocalDate getCreatedAt();

    Long getTotalChallengesJoined();
    Long getTotalChallengesCompleted();
    Long getTotalHostedChallenges();

    Long getTotalEvidenceSubmitted();
    Long getTotalApprovedEvidence();
    Long getTotalRejectedEvidence();

    Long getTotalVotesGiven();
    Long getTotalVotesReceived();

    Long getTotalAchievements();

    Long getTotalStars();
    Integer getApprovedEvidenceCount();
    Integer getCompletedDays();
    Integer getVoteGivenCount();

    Long getTotalGroupsJoined();
    Long getTotalGroupsLed();
}
