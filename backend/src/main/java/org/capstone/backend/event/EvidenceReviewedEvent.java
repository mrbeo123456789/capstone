package org.capstone.backend.event;

import org.capstone.backend.entity.Evidence;

public record EvidenceReviewedEvent(
        Evidence evidence,
        Boolean isApproved
) { }
