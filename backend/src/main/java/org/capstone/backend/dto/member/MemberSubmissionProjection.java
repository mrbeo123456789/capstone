package org.capstone.backend.dto.member;

public interface MemberSubmissionProjection {
    Long getId();
    String getFullName();
    Integer getHasPendingEvidence();
    Integer getEvidenceCount(); // 👈 thêm dòng này
}
