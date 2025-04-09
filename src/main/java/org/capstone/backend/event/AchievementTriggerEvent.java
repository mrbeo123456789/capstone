package org.capstone.backend.event;

import lombok.Getter;

@Getter
public class AchievementTriggerEvent {

    public enum TriggerType {
        CREATE_CHALLENGE,
        JOIN_CHALLENGE,
        COMPLETE_CHALLENGE,
        SUBMIT_EVIDENCE,
        OTHER
    }

    private final Long memberId;
    private final TriggerType type;
    private final Long challengeId;

    public AchievementTriggerEvent(Long memberId, TriggerType type) {
        this(memberId, type, null);
    }

    public AchievementTriggerEvent(Long memberId, TriggerType type, Long challengeId) {
        this.memberId = memberId;
        this.type = type;
        this.challengeId = challengeId;
    }
}
