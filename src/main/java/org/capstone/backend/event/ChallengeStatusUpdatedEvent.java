package org.capstone.backend.event;

import org.capstone.backend.entity.Challenge;

public record ChallengeStatusUpdatedEvent(Challenge challenge, String newStatus) { }
