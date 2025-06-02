package org.capstone.backend.dto.challenge;

import org.capstone.backend.utils.enums.GroupChallengeStatus;

import java.time.LocalDateTime;

public interface GroupChallengeHistoryDTO {
    Long getGroupChallengeId();
    String getChallengeName();
    String getChallengePicture();
    GroupChallengeStatus getStatus();
    Boolean getIsSuccess();
    LocalDateTime getJoinDate();
}
