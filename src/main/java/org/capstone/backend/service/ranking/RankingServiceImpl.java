package org.capstone.backend.service.ranking;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.capstone.backend.dto.rank.ChallengeProgressRankingResponse;
import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.utils.enums.EvidenceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@Slf4j
@RequiredArgsConstructor
public class RankingServiceImpl implements RankingService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final EvidenceRepository evidenceRepository;
    private final EvidenceVoteRepository evidenceVoteRepository;
    private final ChallengeProgressRankingRepository rankingRepository;
 private  final  MemberRepository memberRepository;
    @Override
    public void recalculateAllChallengeProgressRankings() {
        List<Challenge> allChallenges = challengeRepository.findAll();

        for (Challenge challenge : allChallenges) {
            Long challengeId = challenge.getId();
            LocalDate startDate = challenge.getStartDate();
            LocalDate endDate = challenge.getEndDate();

            List<ChallengeMember> members = challengeMemberRepository.findByChallengeId(challengeId);
            List<ChallengeProgressRanking> rankingList = new ArrayList<>();

            for (ChallengeMember cm : members) {
                Long memberId = cm.getMember().getId();

                // Lấy tất cả evidence người dùng đã nộp trong thử thách
                List<Evidence> evidences = evidenceRepository.findByMemberIdAndChallengeIdOrderBySubmittedAtAsc(challengeId, memberId);

                // Đếm số ngày khác nhau user đã nộp evidence
                Set<LocalDate> completedDays = evidences.stream()
                        .map(e -> e.getSubmittedAt().toLocalDate())
                        .filter(d -> !d.isBefore(startDate) && !d.isAfter(endDate))
                        .collect(Collectors.toSet());

                // Đếm số evidence được duyệt
                int approvedCount = (int) evidences.stream()
                        .filter(e -> e.getStatus() == EvidenceStatus.APPROVED)
                        .count();

                // Đếm số vote user đã đi vote cho người khác
                int voteGivenCount = evidenceVoteRepository.countByVoterId(memberId);

                // Tính tổng điểm
                int score = completedDays.size() * 10 + voteGivenCount * 3 + approvedCount * 5;

                rankingList.add(ChallengeProgressRanking.builder()
                        .challengeId(challengeId)
                        .memberId(memberId)
                        .completedDays(completedDays.size())
                        .voteGivenCount(voteGivenCount)
                        .approvedEvidenceCount(approvedCount)
                        .score(score)
                        .build());
            }

            // Cập nhật bảng xếp hạng
            rankingRepository.deleteByChallengeId(challengeId);
            rankingRepository.saveAll(rankingList);
        }


    }
    @Override
    public Page<ChallengeProgressRankingResponse> getPaginatedRankingByChallengeId(Long challengeId, Pageable pageable) {
        Page<ChallengeProgressRanking> page = rankingRepository.findByChallengeId(challengeId, pageable);

        int startRank = (int) pageable.getOffset() + 1;

        List<ChallengeProgressRankingResponse> content = IntStream.range(0, page.getContent().size())
                .mapToObj(i -> {
                    ChallengeProgressRanking r = page.getContent().get(i);
                    return ChallengeProgressRankingResponse.builder()
                            .memberId(r.getMemberId())
                            .memberName( memberRepository.getReferenceById(r.getMemberId()).getFirstName())  // có thể thay bằng service lấy tên thật
                            .rank(startRank + i)
                            .build();
                })
                .toList();

        return new PageImpl<>(content, pageable, page.getTotalElements());
    }



}
