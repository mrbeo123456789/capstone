package org.capstone.backend.service.challenge;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.entity.*;
import org.capstone.backend.event.AchievementTriggerEvent;
import org.capstone.backend.repository.*;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.*;
import org.capstone.backend.utils.upload.FirebaseUpload;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class ChallengeServiceImpl implements ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final AccountRepository accountRepository;
    private final MemberRepository memberRepository;
    private final ChallengeTypeRepository challengeTypeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final FirebaseUpload firebaseUpload;
    private final AuthService authService;
    private final ApplicationEventPublisher eventPublisher;
    private final EvidenceVoteRepository evidenceVoteRepository;
    private final GroupChallengeRepository groupChallengeRepository;
    private final  GroupRepository groupRepository;


    private Member getCurrentMember() {
        Long memberId = authService.getMemberIdFromAuthentication();
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));
    }

    private Challenge findChallenge(Long challengeId) {
        return challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found."));
    }

    private String uploadImageIfPresent(MultipartFile file) {
        try {
            if (file != null && !file.isEmpty()) {
                return firebaseUpload.uploadFile(file, "evidence");
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload failed: " + e.getMessage());
        }
        return null;
    }

    // ============================
    // Helper methods để thêm thành viên vào challenge
    // ============================

    /**
     * Thêm người tạo vào challenge với vai trò HOST.
     * Không cần kiểm tra duplicate vì challenge mới được tạo.
     */
    protected void addHostAsChallengeMember(Challenge challenge, Member member) {
        ChallengeMember challengeMember = ChallengeMember.builder()
                .challenge(challenge)
                .member(member)
                .role(ChallengeRole.HOST)
                .status(ChallengeMemberStatus.JOINED)
                .groupId(null) // Tham gia cá nhân
                .joinBy(member.getId())
                .createdAt(LocalDateTime.now())
                .build();
        challengeMemberRepository.save(challengeMember);
    }

    /**
     * Thêm thành viên vào challenge với vai trò MEMBER.
     * Kiểm tra xem thành viên đã tham gia challenge hay chưa.
     * Nếu groupId != null thì đây là trường hợp tham gia qua Group.
     */
    protected void addParticipantAsChallengeMember(Challenge challenge, Member member, Long groupId) {
        if (challengeMemberRepository.existsByChallengeAndMember(challenge, member)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Thành viên đã tham gia thử thách này rồi.");
        }
        ChallengeMember challengeMember = ChallengeMember.builder()
                .challenge(challenge)
                .member(member)
                .role(ChallengeRole.MEMBER)
                .status(ChallengeMemberStatus.JOINED)
                .groupId(groupId) // null đối với cá nhân
                .joinBy(member.getId())
                .createdAt(LocalDateTime.now())
                .build();
        challengeMemberRepository.save(challengeMember);
    }

    // ============================
    // Các phương thức public của Service
    // ============================

    @Override
    public String joinChallenge(Long challengeId) {
        Member member = getCurrentMember();
        Challenge challenge = findChallenge(challengeId);

        // Chỉ cho phép tham gia nếu thử thách đang ở trạng thái UPCOMING
        // (theo logic hiện tại, bạn có thể điều chỉnh lại trạng thái cho phù hợp)
        if (challenge.getStatus() != ChallengeStatus.UPCOMING) {
            return "Challenge is not currently available for joining.";
        }

        // Kiểm tra số lượng thành viên đã tham gia
        if (challenge.getChallengeMembers().size() >= challenge.getMaxParticipants()) {
            return "Challenge is full.";
        }

        // Thêm member với vai trò MEMBER (tham gia cá nhân: groupId = null)
        addParticipantAsChallengeMember(challenge, member, null);
        eventPublisher.publishEvent(
                new AchievementTriggerEvent(member.getId(), AchievementTriggerEvent.TriggerType.JOIN_CHALLENGE)
        );
        return "Joined challenge successfully.";
    }

    @Override
    public String createChallenge(ChallengeRequest request, MultipartFile picture, MultipartFile banner) {
        Long memberId = authService.getMemberIdFromAuthentication();
        Member member = null;
        Account account;

        if (memberId == null) {
            account = accountRepository.findByUsername("admin")
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin account not found"));
        } else {
            member = memberRepository.findById(memberId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));
            account = member.getAccount();
        }

        ChallengeType challengeType = challengeTypeRepository.findById(request.getChallengeTypeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ChallengeType not found"));

        String pictureUrl = uploadImageIfPresent(picture);
        String bannerUrl = uploadImageIfPresent(banner);

        Challenge challenge = Challenge.builder()
                .name(request.getName())
                .description(request.getDescription())
                .privacy(request.getPrivacy())
                .status(member == null ? ChallengeStatus.APPROVED : ChallengeStatus.PENDING) // Admin tạo tự động approve, còn member để pending
                .verificationType(request.getVerificationType())
                .participationType(request.getParticipationType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .maxParticipants(request.getMaxParticipants())
                .createdBy(memberId)
                .updatedBy(memberId != null ? memberId : account.getId())
                .challengeType(challengeType)
                .picture(pictureUrl)
                .banner(bannerUrl)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        challengeRepository.save(challenge);

        // Nếu là member, thêm người tạo với vai trò HOST
        if (member != null) {
            addHostAsChallengeMember(challenge, member);
        }

        eventPublisher.publishEvent(
                new AchievementTriggerEvent(memberId, AchievementTriggerEvent.TriggerType.CREATE_CHALLENGE)
        );

        return "Challenge đã được tạo thành công.";
    }

    @Override
    public List<ChallengeType> getAllTypes() {
        return challengeTypeRepository.findAll();
    }

    @Override
    public String reviewChallenge(ReviewChallengeRequest request) {
        Challenge challenge = findChallenge(request.getChallengeId());
        ChallengeStatus status;
        try {
            status = ChallengeStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status value.");
        }
        LocalDate now = LocalDate.now();
        if (status == ChallengeStatus.APPROVED) {
            if (challenge.getEndDate().isBefore(now)) {
                status = ChallengeStatus.CANCELED;
            } else if (challenge.getStartDate().isAfter(now)) {
                status = ChallengeStatus.UPCOMING;
            } else {
                status = ChallengeStatus.ONGOING;
            }
        }
        challenge.setStatus(status);
        challenge.setAdminNote(request.getAdminNote());
        challengeRepository.save(challenge);
        return "Challenge status updated successfully.";
    }

    @Override
    @Transactional
    public void toggleCoHost(Long challengeId, Long memberId) {
        Member host = getCurrentMember();
        ChallengeMember hostMember = challengeMemberRepository.findHostByChallengeId(challengeId)
                .orElseThrow(() -> new RuntimeException("Host không tồn tại"));
        if (!hostMember.getMember().getId().equals(host.getId())) {
            throw new RuntimeException("Bạn không có quyền thay đổi role Co-Host");
        }
        ChallengeMember targetMember = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, memberId)
                .orElseThrow(() -> new RuntimeException("Thành viên không tham gia thử thách"));
        ChallengeRole newRole = targetMember.getRole() == ChallengeRole.CO_HOST
                ? ChallengeRole.MEMBER : ChallengeRole.CO_HOST;
        challengeMemberRepository.updateRole(challengeId, memberId, newRole);
    }

    public Page<AdminChallengesResponse> getChallenges(String name, ChallengeStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return challengeRepository.findAllByStatusAndPriority(name, status, pageable);
    }

    @Override
    public Page<ChallengeResponse> getApprovedChallenges(int page, int size) {
        Long memberId = authService.getMemberIdFromAuthentication();
        Pageable pageable = PageRequest.of(page, size);
        return challengeRepository.findApprovedChallengesNotJoined(memberId, pageable);
    }

    @Override
    public List<MyChallengeResponse> getChallengesByMember(ChallengeRole role) {
        Long memberId = authService.getMemberIdFromAuthentication();
        List<MyChallengeBaseResponse> baseList = challengeRepository.findChallengesByMemberAndRole(memberId, role);
        LocalDate today = LocalDate.now();
        return baseList.stream().map(c -> {
            Long remainingDays = null;
            Double avgVotes = null;
            if (c.getStatus() == ChallengeStatus.UPCOMING) {
                remainingDays = ChronoUnit.DAYS.between(today, c.getStartDate());
            } else if (c.getStatus() == ChallengeStatus.ONGOING) {
                remainingDays = ChronoUnit.DAYS.between(today, c.getEndDate());
            } else if (c.getStatus() == ChallengeStatus.FINISH) {
                avgVotes = evidenceVoteRepository.getAverageScoreByMemberInChallenge(memberId, c.getId());
            }
            return new MyChallengeResponse(
                    c.getId(),
                    c.getName(),
                    c.getPicture(),
                    c.getStatus(),
                    c.getRole(),
                    remainingDays,
                    avgVotes
            );
        }).toList();
    }
    @Override
    @Transactional
    public String joinGroupToChallenge(Long groupId, Long challengeId) {
        // Kiểm tra group có tồn tại
        Groups group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found."));

        // Lấy thử thách cần join
        Challenge challenge = findChallenge(challengeId);

        // Kiểm tra trạng thái thử thách (ở đây yêu cầu phải là UPCOMING)
        if (challenge.getStatus() != ChallengeStatus.UPCOMING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Challenge is not available for group joining.");
        }

        // Nếu hệ thống quy định "một group chỉ tham gia 1 thử thách 1 lúc"
        if (groupChallengeRepository.existsByGroupAndStatus(group, GroupChallengeStatus.ONGOING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Group has already joined a challenge.");
        }

        // Kiểm tra số lượng thành viên hiện tại của challenge và đảm bảo thử thách có đủ chỗ cho toàn bộ group
        int currentParticipants = challenge.getChallengeMembers().size();
        List<Member> groupMembers = group.getMembers().stream()
                .map(GroupMember::getMember)
                .toList();

        if (currentParticipants + groupMembers.size() > challenge.getMaxParticipants()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough available spots for the group.");
        }
        List<Member> alreadyJoined = groupMembers.stream()
                .filter(member -> challengeMemberRepository.existsByChallengeAndMember(challenge, member))
                .toList();

        if (!alreadyJoined.isEmpty()) {
            String memberNames = alreadyJoined.stream()
                    .map(Member::getFullName) // hoặc lấy thông tin nhận dạng của member
                    .collect(Collectors.joining(", "));
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Một số thành viên đã tham gia thử thách qua group khác: " + memberNames);
        }
        // Thêm từng thành viên của group vào thử thách với groupId được set (joinGroup)
        for (Member member : groupMembers) {
            addParticipantAsChallengeMember(challenge, member, groupId);
            // Publish event cho mỗi thành viên nếu cần
            eventPublisher.publishEvent(
                    new AchievementTriggerEvent(member.getId(), AchievementTriggerEvent.TriggerType.JOIN_CHALLENGE)
            );
        }

        // Tạo record cho GroupChallenge để dễ query và quản lý
        GroupChallenge groupChallenge = GroupChallenge.builder()
                .group(group)
                .challenge(challenge)
                .joinDate(LocalDateTime.now())
                .status(GroupChallengeStatus.ONGOING)
                .createdAt(LocalDateTime.now())
                .build();
        groupChallengeRepository.save(groupChallenge);

        return "Group joined the challenge successfully.";
    }
    @Override
    public ChallengeDetailResponse getChallengeDetail(Long challengeId) {
        Long memberId = authService.getMemberIdFromAuthentication();
        return challengeRepository.findChallengeDetailByIdAndMemberId(challengeId, memberId);
    }
}
