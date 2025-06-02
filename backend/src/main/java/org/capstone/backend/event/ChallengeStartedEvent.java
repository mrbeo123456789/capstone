package org.capstone.backend.event;

import org.capstone.backend.entity.Challenge;

public record ChallengeStartedEvent(Challenge challenge) { }
