package org.capstone.backend.event;

import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.Member;

public record FirstJoinChallengeEvent(Member member) {}

