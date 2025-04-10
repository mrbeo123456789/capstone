package org.capstone.backend.service.evidence;

import org.capstone.backend.dto.evidence.EvidenceReviewRequest;
import org.capstone.backend.dto.evidence.EvidenceToReviewDTO;
import org.capstone.backend.entity.Evidence;
import org.capstone.backend.entity.EvidenceReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
public interface EvidenceService {
    void uploadAndSubmitEvidence(MultipartFile file, Long challengeId) throws IOException;
    void reviewEvidence(EvidenceReviewRequest request);
    Page<EvidenceToReviewDTO> getEvidenceByChallengeForHost(Long challengeId, int page, int size) ;
    List<EvidenceToReviewDTO> getEvidenceAssignedForMemberToReview(Long challengeId);
    List<EvidenceToReviewDTO> getMySubmittedEvidencesByChallenge(Long challengeId);
    void assignPendingReviewersForChallenge(Long challengeId);
    double getApprovedEvidencePercentage(Long memberId, Long challengeId);
    Page<EvidenceToReviewDTO> getEvidenceByMemberAndChallenge(Long memberId, Long challengeId, Pageable pageable);

}
