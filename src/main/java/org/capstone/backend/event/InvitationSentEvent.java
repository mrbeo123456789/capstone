package org.capstone.backend.event;

import java.util.Map;

public record InvitationSentEvent(
        String targetUserId,
        String titleKey,
        String contentKey,
        Map<String, String> params
) {}
