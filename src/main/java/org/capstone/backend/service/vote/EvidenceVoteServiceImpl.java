package org.capstone.backend.service.vote;

import lombok.RequiredArgsConstructor;

import org.capstone.backend.dto.vote.EvidenceVoteRequest;
import org.capstone.backend.dto.vote.EvidenceVoteResponse;
import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.EvidenceStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvidenceVoteServiceImpl implements EvidenceVoteService {

    private final EvidenceRepository evidenceRepository;
    private final MemberRepository memberRepository;
    private final EvidenceVoteRepository evidenceVoteRepository;
 private final AuthService authService;

    @Override
    @Transactional
    public String voteEvidence(Long evidenceId, EvidenceVoteRequest request) {
        Long voterId = authService.getMemberIdFromAuthentication();

        Evidence evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new RuntimeException("Evidence not found"));

        if (!evidence.getStatus().equals(EvidenceStatus.APPROVED)) {
            throw new RuntimeException("You can only vote approved evidence");
        }



        if (evidence.getMember().getId().equals(voterId)) {
            throw new RuntimeException("You cannot vote your own evidence");
        }


        EvidenceVote vote = EvidenceVote.builder()
                .evidence(evidence)
                .voter(memberRepository.getReferenceById(voterId))
                .score(request.getScore())
                .build();

        evidenceVoteRepository.save(vote);

        return "Vote thành công!";
    }
    @Override
    public List<EvidenceVoteResponse> getEvidenceToVoteByChallenge(Long challengeId) {
        Long voterId = authService.getMemberIdFromAuthentication();

        // 1. Lấy danh sách evidence đã duyệt trong challenge
        List<Evidence> approvedEvidence = evidenceRepository
                .findByChallengeIdAndStatus(challengeId, EvidenceStatus.APPROVED);

        // 2. Lọc evidence hợp lệ: không phải của mình & chưa vote
        List<Evidence> validToVote = approvedEvidence.stream()
                .filter(e -> !e.getMember().getId().equals(voterId))
                .filter(e -> !evidenceVoteRepository.existsByEvidenceIdAndVoterId(e.getId(), voterId))
                .collect(Collectors.toList());

        // 3. Random & limit
        Collections.shuffle(validToVote);

        return validToVote.stream()
                .limit(3)
                .map(e -> EvidenceVoteResponse.builder()
                        .evidenceId(e.getId())
                        .evidenceUrl(e.getEvidenceUrl())
                        .build())
                .collect(Collectors.toList());
    }



}
