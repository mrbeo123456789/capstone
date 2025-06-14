package org.capstone.backend.service.challenge;

import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.dto.member.MemberSubmissionProjection;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeType;
import org.capstone.backend.utils.enums.ChallengeRole;
import org.capstone.backend.utils.enums.ChallengeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ChallengeService {
    AdminDashboardSummaryDTO getAdminDashboardSummary();
    String createChallenge(ChallengeRequest request, MultipartFile picture, MultipartFile banner);
    List<ChallengeType> getAllTypes();
    String reviewChallenge(ReviewChallengeRequest request);
    String joinChallenge(Long challengeId);
    Page<AdminChallengesResponse> getChallenges(String name, String status, int page, int size);
    Page<ChallengeResponse> getApprovedChallenges(int page, int size);
    void toggleCoHost(Long challengeId, Long memberId);
    List<MyChallengeResponse> getChallengesByMember(ChallengeRole role);
    ChallengeDetailResponse getChallengeDetail(Long challengeId);
    String joinGroupToChallenge(Long groupId, Long challengeId);
    String cancelChallenge(Long challengeId);
    String leaveChallenge(Long challengeId);
    String kickMemberFromChallenge(Long challengeId, Long targetMemberId);
    Page<MemberSubmissionProjection> getJoinedMembersWithPendingEvidence(
            Long challengeId, String keyword, int page, int size);
    Page<ChallengeResponse> getUpcomingApprovedChallenges(int page, int size);
    String updateChallenge(Long challengeId, ChallengeRequest request, MultipartFile picture, MultipartFile banner, String pictureUrl, String bannerUrl);
    List<ChallengeSummaryDTO> getCompletedChallenges();
    Integer getMaxMembersPerGroup(Long challengeId);

    ChallengeStatisticDTO getChallengeStatistics(Long challengeId);
    Page<ChallengeDashboardDTO> getAdminChallengeTable(String keyword, ChallengeStatus status, Pageable pageable);
    List<ChallengeParticipationChartDTO> getAdminChallengeParticipationChart();
    Page<ChallengeMemberManagementDTO> getChallengeMembersForManagement(Long challengeId, String keyword, int page, int size);
    Page<ChallengeResponse> getChallengesByStatus(String status, int page, int size);
}
