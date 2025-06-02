package org.capstone.backend.dto.evidence;

import org.capstone.backend.utils.enums.EvidenceStatus;

public record EvidenceStatusCountDTO(EvidenceStatus status, Long count) {}
