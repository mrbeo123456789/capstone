package org.capstone.backend.event;

import org.capstone.backend.entity.Member;

public record DailyEvidenceSubmittedEvent(Member member) {}
