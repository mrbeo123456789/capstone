package org.capstone.backend.event;

public record InvitationSentEvent(String targetUserId, String title, String content,
                                  org.capstone.backend.utils.enums.NotificationType invitation) { }
