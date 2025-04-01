package org.capstone.backend.event;

import lombok.Getter;

@Getter
public class AchievementTriggerEvent {
    public enum TriggerType {
        CREATE_CHALLENGE,
        JOIN_CHALLENGE,
        COMPLETE_CHALLENGE
    }
    private final Long memberId;
    private final TriggerType type;
    private final Long challengeId; // nullable

    public AchievementTriggerEvent(Long memberId, TriggerType type) {
        this(memberId, type, null);
    }

    public AchievementTriggerEvent(Long memberId, TriggerType type, Long challengeId) {
        this.memberId = memberId;
        this.type = type;
        this.challengeId = challengeId;
    }


    }


