package org.capstone.backend.service.vote;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.vote.EvidenceVoteRequest;
import org.capstone.backend.dto.vote.EvidenceVoteResponse;
import org.capstone.backend.entity.Evidence;
import org.capstone.backend.entity.EvidenceVote;
import org.capstone.backend.repository.EvidenceRepository;
import org.capstone.backend.repository.EvidenceVoteRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.EvidenceStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bằng chứng."));

        if (!evidence.getStatus().equals(EvidenceStatus.APPROVED)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn chỉ có thể bình chọn những bằng chứng đã được phê duyệt.");
        }

        if (evidence.getMember().getId().equals(voterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không được phép bình chọn bằng chứng của chính mình.");
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

        // 1. Lấy danh sách bằng chứng đã được phê duyệt trong thử thách
        List<Evidence> approvedEvidence = evidenceRepository
                .findByChallengeIdAndStatus(challengeId, EvidenceStatus.APPROVED);

        // 2. Lọc những bằng chứng hợp lệ: không phải của mình & chưa được bình chọn
        List<Evidence> validToVote = approvedEvidence.stream()
                .filter(e -> !e.getMember().getId().equals(voterId))
                .filter(e -> !evidenceVoteRepository.existsByEvidenceIdAndVoterId(e.getId(), voterId))
                .collect(Collectors.toList());

        // 3. Xáo trộn ngẫu nhiên danh sách và lấy tối đa 3 bằng chứng
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
