package org.capstone.backend.service.ranking;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.capstone.backend.dto.rank.ChallengeProgressRankingResponse;
import org.capstone.backend.dto.rank.ChallengeStarRatingResponse;
import org.capstone.backend.dto.rank.GlobalMemberRankingResponse;
import org.capstone.backend.dto.rank.GlobalRankingDto;
import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.utils.enums.EvidenceStatus;
import org.capstone.backend.utils.key.ChallengeProgressRankingId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
 private  final   ChallengeStarRatingRepository challengeStarRatingRepository;
    private final GlobalMemberRankingRepository globalMemberRankingRepository;

    @Override
    @Transactional // Đảm bảo tất cả hành động xóa và insert nằm trong 1 transaction
    public void recalculateAllChallengeProgressRankings() {
        List<Challenge> allChallenges = challengeRepository.findAll();

        for (Challenge challenge : allChallenges) {
            Long challengeId = challenge.getId();
            LocalDate startDate = challenge.getStartDate();
            LocalDate endDate = challenge.getEndDate();

            List<ChallengeProgressRanking> rankingList = challengeMemberRepository.findJoinedMembersByChallengeId(challengeId)
                    .stream()
                    .map(cm -> {
                        Long memberId = cm.getMember().getId();

                        List<Evidence> evidences = evidenceRepository
                                .findByMemberIdAndChallengeIdOrderBySubmittedAtAsc(challengeId, memberId);

                        Set<LocalDate> completedDays = evidences.stream()
                                .map(e -> e.getSubmittedAt().toLocalDate())
                                .filter(d -> !d.isBefore(startDate) && !d.isAfter(endDate))
                                .collect(Collectors.toSet());

                        int approvedCount = (int) evidences.stream()
                                .filter(e -> e.getStatus() == EvidenceStatus.APPROVED)
                                .count();

                        int voteGivenCount = evidenceVoteRepository.countByVoterId(memberId);

                        int score = completedDays.size() * 10 + voteGivenCount * 3 + approvedCount * 5;

                        return ChallengeProgressRanking.builder()
                                .id(new ChallengeProgressRankingId(challengeId, memberId))
                                .completedDays(completedDays.size())
                                .voteGivenCount(voteGivenCount)
                                .approvedEvidenceCount(approvedCount)
                                .score(score)
                                .createdAt(LocalDateTime.now())
                                .build();


                    })
                    .collect(Collectors.toList());

            rankingRepository.deleteByChallengeId(challengeId);
            rankingRepository.saveAll(rankingList);
        }
    }



    @Override
    public List<ChallengeProgressRankingResponse> getTop3RankingByChallengeId(Long challengeId) {
        List<ChallengeProgressRanking> rankings = rankingRepository
                .findTop3ById_ChallengeIdOrderByScoreDesc(challengeId);

        return IntStream.range(0, rankings.size())
                .mapToObj(i -> {
                    ChallengeProgressRanking r = rankings.get(i);
                    Long memberId = r.getId().getMemberId();
                    var member = memberRepository.getReferenceById(memberId); // lấy full member object

                    return ChallengeProgressRankingResponse.builder()
                            .memberId(memberId)
                            .memberName(member.getFullName())
                            .avatar(member.getAvatar()) // 👈 thêm dòng này
                            .rank(i + 1)
                            .build();
                })
                .toList();
    }




    @Transactional
    public void updateChallengeStarRatings() {
        List<Long> challengeIds = challengeRepository.findAllOngoingChallengeIds();

        for (Long challengeId : challengeIds) {
            // Tính sao trung bình cho từng member trong thử thách
            List<Object[]> ratings = evidenceVoteRepository.calculateReceivedRatingStats(challengeId);

            for (Object[] row : ratings) {
                Long memberId = (Long) row[0];
                int totalStar = ((Number) row[1]).intValue();
                int receivedCount = ((Number) row[2]).intValue();
                double average = receivedCount == 0 ? 0.0 : ((double) totalStar / receivedCount);

                int givenCount = evidenceVoteRepository
                        .countVotesGivenByMemberInChallenge(memberId, challengeId);

                ChallengeStarRating rating = challengeStarRatingRepository
                        .findByChallengeIdAndMemberId(challengeId, memberId)
                        .orElse(new ChallengeStarRating());

                rating.setChallengeId(challengeId);
                rating.setMemberId(memberId);
                rating.setTotalStar(totalStar);
                rating.setTotalRatingCount(receivedCount);
                rating.setAverageStar(average);
                rating.setGivenRatingCount(givenCount);
                rating.setUpdatedAt(LocalDateTime.now());

                challengeStarRatingRepository.save(rating);
            }
        }
    }
    @Override
    public Page<ChallengeStarRatingResponse> getStarRatingsByChallengeId(Long challengeId, Pageable pageable) {
        // Fetch all members who joined the challenge (pagination applied later)
        List<ChallengeMember> allMembers = challengeMemberRepository.findJoinedMembersByChallengeId(challengeId);

        List<ChallengeStarRatingResponse> allResponses = allMembers.stream()
                .map(cm -> {
                    var member = cm.getMember();
                    var rating = challengeStarRatingRepository
                            .findByChallengeIdAndMemberId(challengeId, member.getId())
                            .orElse(null);

                    return ChallengeStarRatingResponse.builder()
                            .memberId(member.getId())
                            .memberName(member.getFullName())
                            .avatar(member.getAvatar())
                            .averageStar(rating != null ? roundTo1Decimal(rating.getAverageStar()) : 0.0)
                            .build();
                })
                .sorted(Comparator
                        .comparing(ChallengeStarRatingResponse::getAverageStar).reversed()
                        .thenComparing(ChallengeStarRatingResponse::getMemberName)) // Stable sort
                .toList();

        // Manual pagination AFTER sorting
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allResponses.size());
        List<ChallengeStarRatingResponse> paged = allResponses.subList(start, end);

        return new PageImpl<>(paged, pageable, allResponses.size());
    }



    private double roundTo1Decimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    @Transactional
    public void updateGlobalRanking() {
        // Lấy dữ liệu bảng xếp hạng mới
        List<GlobalRankingDto> rankingDtos = globalMemberRankingRepository.calculateGlobalRanking();

        // Xóa toàn bộ bảng xếp hạng hiện tại
        globalMemberRankingRepository.deleteAllInBatch();

        // Mapping DTO -> Entity
        List<GlobalMemberRanking> newRankings = rankingDtos.stream()
                .map(dto -> GlobalMemberRanking.builder()
                        .memberId(dto.getMemberId())
                        .fullName(dto.getFullName())
                        .totalStars(dto.getTotalStars())
                        .lastUpdated(java.time.LocalDateTime.now())
                        .build())
                .collect(Collectors.toList());

        // Save bảng xếp hạng mới
        globalMemberRankingRepository.saveAll(newRankings);
    }

    @Override
    public Page<GlobalMemberRankingResponse> getGlobalRanking(Pageable pageable) {
        Page<GlobalMemberRanking> page = globalMemberRankingRepository.findAllByOrderByTotalStarsDesc(pageable);

        List<GlobalMemberRankingResponse> content = page.getContent().stream()
                .map(ranking -> {
                    var member = memberRepository.getReferenceById(ranking.getMemberId());

                    return GlobalMemberRankingResponse.builder()
                            .memberId(ranking.getMemberId())
                            .fullName(ranking.getFullName())
                            .totalStars(ranking.getTotalStars())
                            .avatar(member.getAvatar()) // 👈 lấy avt từ bảng Member
                            .build();
                })
                .toList();

        return new PageImpl<>(content, pageable, page.getTotalElements());
    }


}
