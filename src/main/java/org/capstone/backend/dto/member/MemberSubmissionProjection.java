package org.capstone.backend.dto.member;

public interface MemberSubmissionProjection {
    Long getId();
    String getFullName();
    Boolean getHasPendingEvidence();
}
