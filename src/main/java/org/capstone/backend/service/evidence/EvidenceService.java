package org.capstone.backend.service.evidence;

import org.capstone.backend.dto.evidence.EvidenceReviewRequest;
import org.capstone.backend.dto.evidence.EvidenceStatusCountDTO;
import org.capstone.backend.dto.evidence.EvidenceToReviewDTO;
import org.capstone.backend.dto.evidence.TaskChecklistDTO;
import org.capstone.backend.dto.member.MemberSubmissionProjection;
import org.capstone.backend.entity.Evidence;
import org.capstone.backend.entity.EvidenceReport;
import org.capstone.backend.utils.enums.EvidenceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
public interface EvidenceService {
    void uploadAndSubmitEvidence(MultipartFile file, Long challengeId) ;
    void reviewEvidence(EvidenceReviewRequest request);
    Page<EvidenceToReviewDTO> getEvidenceByChallengeForHost(
            Long challengeId,
            Long memberId,
            EvidenceStatus status,
            int page,
            int size)  ;
    List<EvidenceToReviewDTO> getEvidenceAssignedForMemberToReview(Long challengeId);
    List<EvidenceToReviewDTO> getMySubmittedEvidencesByChallenge(Long challengeId);
    void assignPendingReviewersForChallenge(Long challengeId);
    double getApprovedEvidencePercentage(Long memberId, Long challengeId);
    List<TaskChecklistDTO> getTasksForDate(LocalDate date);
     List<EvidenceStatusCountDTO> countEvidenceByStatusForHost(
            Long challengeId,
            Long memberId
    );

}
