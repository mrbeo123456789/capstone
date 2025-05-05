package org.capstone.backend.event;

import org.capstone.backend.entity.ChallengeMember;
import org.capstone.backend.utils.enums.ChallengeRole;

public record ChallengeRoleUpdatedEvent(ChallengeMember member, ChallengeRole newRole) { }
