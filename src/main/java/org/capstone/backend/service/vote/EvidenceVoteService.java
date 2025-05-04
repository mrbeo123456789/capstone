package org.capstone.backend.service.vote;


import org.capstone.backend.dto.evidence.EvidenceVoteHistoryResponse;
import org.capstone.backend.dto.vote.EvidenceVoteRequest;
import org.capstone.backend.dto.vote.EvidenceVoteResponse;

import java.util.List;

public interface EvidenceVoteService {
    String voteEvidence(Long evidenceId, EvidenceVoteRequest request);
    List<EvidenceVoteResponse> getEvidenceToVoteByChallenge(Long challengeId);
    List<EvidenceVoteResponse> getVoteHistoryForChallenge(Long challengeId);
    List<EvidenceVoteHistoryResponse> getMyVotedEvidence(Long challengeId);
}
