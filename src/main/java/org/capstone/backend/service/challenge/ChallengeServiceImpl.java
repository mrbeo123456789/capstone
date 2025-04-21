package org.capstone.backend.service.challenge;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.dto.member.MemberSubmissionProjection;
import org.capstone.backend.entity.*;
import org.capstone.backend.event.AchievementTriggerEvent;
import org.capstone.backend.event.ChallengeRoleUpdatedEvent;
import org.capstone.backend.event.ChallengeStatusUpdatedEvent;
import org.capstone.backend.event.InvitationSentEvent;
import org.capstone.backend.repository.*;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.*;
import org.capstone.backend.utils.upload.FirebaseUpload;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class ChallengeServiceImpl implements ChallengeService {

    // --- Các thông báo lỗi ---
    private static final String MEMBER_NOT_FOUND_MSG = "Không tìm thấy thành viên.";
    private static final String CHALLENGE_NOT_FOUND_MSG = "Không tìm thấy thử thách.";
    private static final String GROUP_NOT_FOUND_MSG = "Không tìm thấy nhóm.";
    private static final String UPLOAD_FAILED_MSG = "Tải lên thất bại: ";
    private static final String CHALLENGE_NOT_JOINABLE = "Thử thách hiện không có sẵn để tham gia.";
    private static final String CHALLENGE_FULL = "Thử thách đã đầy.";
    private static final String ALREADY_JOINED_MSG = "Thành viên đã tham gia thử thách này rồi.";
    private static final String KICK_YOURSELF_MSG = "Bạn không thể kick chính mình.";

    // --- Các dependency được inject ---
    private final ChallengeRepository challengeRepository;
    private final MemberRepository memberRepository;
    private final ChallengeTypeRepository challengeTypeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final FirebaseUpload firebaseUpload;
    private final AuthService authService;
    private final ApplicationEventPublisher eventPublisher;
    private final EvidenceVoteRepository evidenceVoteRepository;
    private final GroupChallengeRepository groupChallengeRepository;
    private final GroupRepository groupRepository;

    // --- Phương thức hỗ trợ chung ---

    /**
     * Lấy thông tin member hiện tại hoặc ném lỗi khi không tìm thấy.
     */
    private Member getCurrentMember() {
        Long memberId = authService.getMemberIdFromAuthentication();
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, MEMBER_NOT_FOUND_MSG));
    }

    /**
     * Lấy thử thách theo id hoặc ném lỗi khi không tìm thấy.
     */
    private Challenge getChallenge(Long challengeId) {
        return challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, CHALLENGE_NOT_FOUND_MSG));
    }

    /**
     * Upload file nếu có và trả về URL; nếu có lỗi sẽ ném lỗi.
     */
    private String uploadImageIfPresent(MultipartFile file) {
        if (file != null && !file.isEmpty()) {
            try {
                return firebaseUpload.uploadFile(file, "evidence");
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, UPLOAD_FAILED_MSG + e.getMessage());
            }
        }
        return null;
    }

    /**
     * Gửi sự kiện kích hoạt thành tích.
     */
    private void publishAchievementEvent(Long memberId, AchievementTriggerEvent.TriggerType triggerType) {
        eventPublisher.publishEvent(new AchievementTriggerEvent(memberId, triggerType));
    }

    // --- Các phương thức hỗ trợ quản lý thành viên của thử thách ---

    protected void addHostAsChallengeMember(Challenge challenge, Member member) {
        ChallengeMember challengeMember = ChallengeMember.builder()
                .challenge(challenge)
                .member(member)
                .role(ChallengeRole.HOST)
                .status(ChallengeMemberStatus.JOINED)
                .groupId(null)
                .joinBy(member.getId())
                .createdAt(LocalDateTime.now())
                .build();
        challengeMemberRepository.save(challengeMember);
    }

    protected void addParticipantAsChallengeMember(Challenge challenge, Member member, Long groupId) {
        challengeMemberRepository.findByChallengeIdAndMemberId(challenge.getId(), member.getId()).ifPresent(existing -> {
            if (existing.getStatus() == ChallengeMemberStatus.KICKED) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Bạn đã bị kick khỏi thử thách và không thể tham gia lại.");
            } else {
                throw new ResponseStatusException(HttpStatus.CONFLICT, ALREADY_JOINED_MSG);
            }
        });
        ChallengeMember challengeMember = ChallengeMember.builder()
                .challenge(challenge)
                .member(member)
                .role(ChallengeRole.MEMBER)
                .status(ChallengeMemberStatus.JOINED)
                .groupId(groupId)
                .joinBy(member.getId())
                .createdAt(LocalDateTime.now())
                .build();
        challengeMemberRepository.save(challengeMember);
    }

    /**
     * Kiểm tra quyền kick: nếu caller cố gắng kick chính mình hoặc không đủ quyền thì ném lỗi.
     */
    private void assertKickPermission(Long callerId, ChallengeMember callerRecord, ChallengeMember targetRecord) {
        if (callerId.equals(targetRecord.getMember().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, KICK_YOURSELF_MSG);
        }
        ChallengeRole callerRole = callerRecord.getRole();
        ChallengeRole targetRole = targetRecord.getRole();
        if (callerRole == ChallengeRole.HOST) {
            if (targetRole == ChallengeRole.HOST) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Host không thể kick thành viên có vai trò Host.");
            }
        } else if (callerRole == ChallengeRole.CO_HOST) {
            if (targetRole != ChallengeRole.MEMBER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Co-Host chỉ có thể kick thành viên thường.");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền kick thành viên.");
        }
    }

    // --- Các phương thức nghiệp vụ của thử thách ---

    @Override
    public String joinChallenge(Long challengeId) {
        Member member = getCurrentMember();
        Challenge challenge = getChallenge(challengeId);

        if (challenge.getStatus() != ChallengeStatus.UPCOMING) {
            return CHALLENGE_NOT_JOINABLE;
        }
        if (challenge.getChallengeMembers().size() >= challenge.getMaxParticipants()) {
            return CHALLENGE_FULL;
        }
        addParticipantAsChallengeMember(challenge, member, null);
        publishAchievementEvent(member.getId(), AchievementTriggerEvent.TriggerType.JOIN_CHALLENGE);
        return "Tham gia thử thách thành công.";
    }

    @Override
    public String createChallenge(ChallengeRequest request, MultipartFile picture, MultipartFile banner) {
        Long memberId = authService.getMemberIdFromAuthentication();
        boolean isMember = (memberId != null);

        ChallengeType challengeType = challengeTypeRepository.findById(request.getChallengeTypeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loại thử thách không tồn tại."));

        String pictureUrl = uploadImageIfPresent(picture);
        String bannerUrl = uploadImageIfPresent(banner);

        Challenge challenge = Challenge.builder()
                .name(request.getName())
                .description(request.getDescription())
                .summary(request.getSummary())
                .privacy(request.getPrivacy())
                .status(isMember ? ChallengeStatus.PENDING : ChallengeStatus.APPROVED)
                .verificationType(request.getVerificationType())
                .participationType(request.getParticipationType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .maxParticipants(request.getMaxParticipants())
                .challengeType(challengeType)
                .picture(pictureUrl)
                .banner(bannerUrl)
                .build();

        challengeRepository.save(challenge);

        if (isMember) {
            Member member = memberRepository.findById(memberId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, MEMBER_NOT_FOUND_MSG));
            addHostAsChallengeMember(challenge, member);
        }

        publishAchievementEvent(memberId, AchievementTriggerEvent.TriggerType.CREATE_CHALLENGE);
        return "Thử thách đã được tạo thành công.";
    }

    @Override
    public List<ChallengeType> getAllTypes() {
        return challengeTypeRepository.findAll();
    }

    @Override
    public String reviewChallenge(ReviewChallengeRequest request) {
        Challenge challenge = getChallenge(request.getChallengeId());
        ChallengeStatus status = convertChallengeStatus(request.getStatus());

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

        eventPublisher.publishEvent(new ChallengeStatusUpdatedEvent(challenge, status.name()));
        return "Trạng thái thử thách đã được cập nhật thành công.";
    }

    @Override
    @Transactional
    public void toggleCoHost(Long challengeId, Long targetMemberId) {
        Long currentMemberId = authService.getMemberIdFromAuthentication();
        boolean isAdmin = (currentMemberId == null);

        if (!isAdmin) {
            ChallengeMember hostMember = challengeMemberRepository.findHostByChallengeId(challengeId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Thử thách không có Host."));
            if (!hostMember.getMember().getId().equals(currentMemberId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền thay đổi vai trò Co-Host.");
            }
        }

        ChallengeMember targetMember = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, targetMemberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thành viên không tham gia thử thách."));
        ChallengeRole newRole = (targetMember.getRole() == ChallengeRole.CO_HOST)
                ? ChallengeRole.MEMBER
                : ChallengeRole.CO_HOST;
        challengeMemberRepository.updateRole(challengeId, targetMemberId, newRole);
        eventPublisher.publishEvent(new ChallengeRoleUpdatedEvent(targetMember, newRole));
    }

    @Override
    public Page<AdminChallengesResponse> getChallenges(String name, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        ChallengeStatus challengeStatus = convertChallengeStatus(status);
        return challengeRepository.findAllByStatusAndPriority(name, challengeStatus, pageable);
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
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public String joinGroupToChallenge(Long groupId, Long challengeId) {
        Groups group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, GROUP_NOT_FOUND_MSG));
        Challenge challenge = getChallenge(challengeId);

        if (challenge.getStatus() != ChallengeStatus.UPCOMING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thử thách hiện không cho phép nhóm tham gia.");
        }
        if (groupChallengeRepository.existsByGroupAndStatus(group, GroupChallengeStatus.ONGOING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nhóm đã tham gia một thử thách.");
        }

        int currentParticipants = challenge.getChallengeMembers().size();
        List<Member> groupMembers = group.getMembers().stream()
                .map(GroupMember::getMember)
                .toList();

        if (currentParticipants + groupMembers.size() > challenge.getMaxParticipants()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không đủ chỗ cho nhóm.");
        }

        List<Member> alreadyJoined = groupMembers.stream()
                .filter(member -> challengeMemberRepository.existsByChallengeAndMember(challenge, member))
                .toList();
        if (!alreadyJoined.isEmpty()) {
            String memberNames = alreadyJoined.stream()
                    .map(Member::getFullName)
                    .collect(Collectors.joining(", "));
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Một số thành viên đã tham gia thử thách qua nhóm khác: " + memberNames);
        }

        for (Member member : groupMembers) {
            addParticipantAsChallengeMember(challenge, member, groupId);
            publishAchievementEvent(member.getId(), AchievementTriggerEvent.TriggerType.JOIN_CHALLENGE);
        }

        GroupChallenge groupChallenge = GroupChallenge.builder()
                .group(group)
                .challenge(challenge)
                .joinDate(LocalDateTime.now())
                .status(GroupChallengeStatus.ONGOING)
                .createdAt(LocalDateTime.now())
                .build();
        groupChallengeRepository.save(groupChallenge);

        return "Nhóm đã tham gia thử thách thành công.";
    }

    @Override
    public ChallengeDetailResponse getChallengeDetail(Long challengeId) {
        Long memberId = authService.getMemberIdFromAuthentication();
        return challengeRepository.findChallengeDetailByIdAndMemberId(challengeId, memberId);
    }

    @Override
    @Transactional
    public String leaveChallenge(Long challengeId) {
        Member member = getCurrentMember();
        Challenge challenge = getChallenge(challengeId);

        if (challenge.getStatus() != ChallengeStatus.UPCOMING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể rời thử thách khi đã bắt đầu hoặc kết thúc.");
        }

        ChallengeMember challengeMember = challengeMemberRepository.findByChallengeIdAndMemberId(challenge.getId(), member.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bạn không tham gia thử thách này."));
        challengeMember.setStatus(ChallengeMemberStatus.LEFT);
        challengeMemberRepository.save(challengeMember);
        return "Bạn đã rời khỏi thử thách thành công.";
    }

    @Override
    @Transactional
    public String cancelChallenge(Long challengeId) {
        Long memberId = authService.getMemberIdFromAuthentication();
        boolean isAdmin = (memberId == null);
        Challenge challenge = getChallenge(challengeId);

        if (challenge.getStatus() != ChallengeStatus.UPCOMING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ có thể huỷ thử thách khi chưa bắt đầu.");
        }
        if (!isAdmin) {
            ChallengeMember hostMember = challengeMemberRepository.findHostByChallengeId(challengeId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Thử thách không có Host."));
            if (!hostMember.getMember().getId().equals(memberId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền huỷ thử thách này.");
            }
        }

        challenge.setStatus(ChallengeStatus.CANCELED);
        challengeRepository.save(challenge);

        // Gửi thông báo cho tất cả thành viên tham gia qua event
        List<ChallengeMember> challengeMembers = challengeMemberRepository.findByChallenge(challenge);
        for (ChallengeMember cm : challengeMembers) {
            eventPublisher.publishEvent(new InvitationSentEvent(
                    cm.getMember().getId().toString(),
                    "notification.challengeCancelled.title",
                    "notification.challengeCancelled.content",
                    Map.of("challengeName", challenge.getName())

            ));
        }

        return "Thử thách đã được huỷ thành công.";
    }

    @Override
    @Transactional
    public String kickMemberFromChallenge(Long challengeId, Long targetMemberId) {
        Long currentMemberId = authService.getMemberIdFromAuthentication();
        boolean isAdmin = (currentMemberId == null);

        ChallengeMember targetRecord = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, targetMemberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thành viên không tham gia thử thách."));

        if (!isAdmin) {
            ChallengeMember callerRecord = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, currentMemberId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không tham gia thử thách."));
            assertKickPermission(currentMemberId, callerRecord, targetRecord);
        }

        targetRecord.setStatus(ChallengeMemberStatus.KICKED);
        challengeMemberRepository.save(targetRecord);
        eventPublisher.publishEvent(new InvitationSentEvent(
                targetMemberId.toString(),
                "notification.kickedFromChallenge.title",
                "notification.kickedFromChallenge.content",
                Map.of("challengeName", targetRecord.getChallenge().getName())
        ));

        return "Thành viên đã bị kick khỏi thử thách thành công.";
    }

    /**
     * Chuyển đổi giá trị trạng thái từ chuỗi (không phân biệt chữ hoa chữ thường) sang enum ChallengeStatus.
     * Nếu giá trị không hợp lệ, ném lỗi Bad Request.
     */
    private ChallengeStatus convertChallengeStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        String trimmed = status.trim();
        for (ChallengeStatus cs : ChallengeStatus.values()) {
            if (cs.name().equalsIgnoreCase(trimmed)) {
                return cs;
            }
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá trị trạng thái không hợp lệ: " + status);
    }


    @Override
    public Page<MemberSubmissionProjection> getJoinedMembersWithPendingEvidence(
            Long challengeId, String keyword, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);
        return challengeMemberRepository.findMembersWithPendingEvidence(
                challengeId, keyword == null ? "" : keyword, pageable
        );
    }

    @Override
    public Page<ChallengeResponse> getUpcomingApprovedChallenges(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.asc("startDate")));

        Page<Challenge> challengePage = challengeRepository.findUpcomingChallenges(
                ChallengeStatus.UPCOMING, LocalDate.now(), pageable
        );

        return challengePage.map(this::convertToResponse);
    }

    @Override
    @Transactional
    public String updateChallenge(Long challengeId, ChallengeRequest request, MultipartFile picture, MultipartFile banner, String pictureUrl, String bannerUrl) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, CHALLENGE_NOT_FOUND_MSG));

        ChallengeType challengeType = challengeTypeRepository.findById(request.getChallengeTypeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại thử thách không hợp lệ."));

        challenge.setName(request.getName());
        challenge.setSummary(request.getSummary());
        challenge.setStartDate(request.getStartDate());
        challenge.setEndDate(request.getEndDate());
        challenge.setPrivacy(request.getPrivacy());
        challenge.setVerificationType(request.getVerificationType());
        challenge.setParticipationType(request.getParticipationType());
        challenge.setChallengeType(challengeType);
        challenge.setMaxParticipants(request.getMaxParticipants());
        challenge.setDescription(request.getDescription());

        // ✅ Handle picture
        if (picture != null && !picture.isEmpty()) {
            String pictureUrlUploaded = uploadImageIfPresent(picture);
            challenge.setPicture(pictureUrlUploaded);
        } else if (pictureUrl != null && !pictureUrl.isBlank()) {
            challenge.setPicture(pictureUrl);
        }

        // ✅ Handle banner
        if (banner != null && !banner.isEmpty()) {
            String bannerUrlUploaded = uploadImageIfPresent(banner);
            challenge.setBanner(bannerUrlUploaded);
        } else if (bannerUrl != null && !bannerUrl.isBlank()) {
            challenge.setBanner(bannerUrl);
        }

        challengeRepository.save(challenge);
        return "Thử thách đã được cập nhật thành công.";
    }


    private ChallengeResponse convertToResponse(Challenge challenge) {
        return new ChallengeResponse(
                challenge.getId(),
                challenge.getName(),
                challenge.getSummary(),
                challenge.getPicture(),
                challenge.getStartDate(),
                challenge.getEndDate(),
                challenge.getChallengeType().getName(),        // assuming challengeType is not null
                challenge.getParticipationType()
        );
    }

}
