package org.capstone.backend.service.challenge;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.dto.member.MemberSubmissionProjection;
import org.capstone.backend.entity.*;
import org.capstone.backend.event.ChallengeRoleUpdatedEvent;
import org.capstone.backend.event.ChallengeStatusUpdatedEvent;
import org.capstone.backend.event.FirstChallengeJoinedEvent;
import org.capstone.backend.event.InvitationSentEvent;
import org.capstone.backend.repository.*;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.*;
import org.capstone.backend.utils.upload.FirebaseUpload;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Transactional
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
    private final ChallengeStarRatingRepository challengeStarRatingRepository;
    private final FirebaseUpload firebaseUpload;
    private final AuthService authService;
    private final ApplicationEventPublisher eventPublisher;
    private final EvidenceVoteRepository evidenceVoteRepository;
    private final EvidenceRepository evidenceRepository;
    private final EvidenceReportRepository evidenceReportRepository;
    private final GroupChallengeRepository groupChallengeRepository;
    private final GroupRepository groupRepository;
    private  final GroupMemberRepository groupMemberRepository;
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


    // --- Các phương thức hỗ trợ quản lý thành viên của thử thách ---

    protected void addHostAsChallengeMember(Challenge challenge,
                                            Member member,
                                            Boolean isParticipate) {
        // Tìm xem đã có record host trước đó chưa
        Optional<ChallengeMember> existing = challengeMemberRepository
                .findHostByChallengeId(challenge.getId());
        if (existing.isPresent()) {
            ChallengeMember cm = existing.get();
            cm.setIsParticipate(isParticipate);
            cm.setStatus(ChallengeMemberStatus.JOINED);
            challengeMemberRepository.save(cm);
        } else {
            ChallengeMember cm = ChallengeMember.builder()
                    .challenge(challenge)
                    .member(member)
                    .role(ChallengeRole.HOST)
                    .status(ChallengeMemberStatus.JOINED)
                    .groupId(null)
                    .joinBy(member.getId())
                    .isParticipate(isParticipate)
                    .createdAt(LocalDateTime.now())
                    .build();
            challengeMemberRepository.save(cm);
        }
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
        eventPublisher.publishEvent(new FirstChallengeJoinedEvent(member));

        addParticipantAsChallengeMember(challenge, member, null);
        return "Tham gia thử thách thành công.";
    }

    @Override
    @Transactional
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
                .maxGroups(request.getMaxGroups())                      // ✅ THÊM DÒNG NÀY
                .maxMembersPerGroup(request.getMaxMembersPerGroup())    // ✅ THÊM DÒNG NÀY
                .challengeType(challengeType)
                .picture(pictureUrl)
                .banner(bannerUrl)
                .build();

        challengeRepository.save(challenge);

        // Nếu user có groupId -> tự động join group vào challenge


        // Nếu đang login, thì add người tạo làm Host (CO_HOST)
        if (isMember) {
            Member member = memberRepository.findById(memberId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, MEMBER_NOT_FOUND_MSG));
            addHostAsChallengeMember(challenge, member, request.getIsParticipate());
            if (request.getGroupId() != null){
                joinGroupToChallengeExcludingCreator(request.getGroupId(), challenge.getId() , member.getId());

            }
        }

        return "Thử thách đã được tạo thành công.";
    }
    @Transactional
    public void joinGroupToChallengeExcludingCreator(Long groupId, Long challengeId, Long creatorId) {
        joinGroupToChallengeInternal(groupId, challengeId, creatorId);
    }
    @Override
    @Transactional
    public String joinGroupToChallenge(Long groupId, Long challengeId) {
        return joinGroupToChallengeInternal(groupId, challengeId, null);
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

        String statusMessage = status.name();
        if ((status == ChallengeStatus.UPCOMING || status == ChallengeStatus.REJECTED)
                && request.getAdminNote() != null && !request.getAdminNote().isBlank()) {
            statusMessage += " - " + request.getAdminNote();  // ✅ gộp note vào chuỗi status
        }

        eventPublisher.publishEvent(new ChallengeStatusUpdatedEvent(challenge, statusMessage));

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
                    avgVotes,
                    c.getParticipationType()
            );
        }).collect(Collectors.toList());
    }


    private String joinGroupToChallengeInternal(Long groupId, Long challengeId, Long excludeMemberId) {
        // 1. Lấy dữ liệu
        Groups group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, GROUP_NOT_FOUND_MSG));
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, CHALLENGE_NOT_FOUND_MSG));

        // 2. Kiểm tra số nhóm đã tham gia
        long joinedGroupCount = groupChallengeRepository.countByChallengeAndStatus(challenge, GroupChallengeStatus.ONGOING);
        Integer maxGroups = challenge.getMaxGroups();
        if (maxGroups != null && joinedGroupCount >= maxGroups) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đã đạt tối đa số nhóm tham gia: " + maxGroups);
        }

        // 3. Lấy thành viên ACTIVE trong nhóm (loại trừ creator nếu có)
        List<Member> members = groupMemberRepository.findMembersByGroupIdAndStatus(groupId, GroupMemberStatus.ACTIVE)
                .stream()
                .filter(m -> !m.getId().equals(excludeMemberId))
                .toList();

        // 4. Kiểm tra số lượng thành viên nhóm
        Integer maxPerGroup = challenge.getMaxMembersPerGroup();
        if (maxPerGroup != null && members.size() > maxPerGroup) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mỗi nhóm tối đa " + maxPerGroup + " thành viên.");
        }



        // 6. Kiểm tra trùng lặp cá nhân
        List<String> conflicted = members.stream()
                .filter(m -> challengeMemberRepository.existsByChallengeAndMember(challenge, m))
                .map(Member::getFullName)
                .toList();
        if (!conflicted.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "MEMBER_ALREADY_JOINED:" + conflicted.get(0));
        }

        // 7. Tạo bản ghi ChallengeMember
        LocalDateTime now = LocalDateTime.now();
        List<ChallengeMember> toSave = members.stream()
                .map(m -> ChallengeMember.builder()
                        .challenge(challenge)
                        .member(m)
                        .role(ChallengeRole.MEMBER)
                        .status(ChallengeMemberStatus.JOINED)
                        .groupId(groupId)
                        .isParticipate(true)
                        .joinBy(null)
                        .createdAt(now)
                        .build())
                .toList();
        challengeMemberRepository.saveAll(toSave);

        // 8. Ghi nhận group đã tham gia challenge
        GroupChallenge gc = GroupChallenge.builder()
                .group(group)
                .challenge(challenge)
                .status(GroupChallengeStatus.ONGOING)
                .joinDate(now)
                .createdAt(now)
                .build();
        groupChallengeRepository.save(gc);

        return "Nhóm đã tham gia thử thách thành công.";
    }


    @Override
    public ChallengeDetailResponse getChallengeDetail(Long challengeId) {
        Long memberId = null;
        try {
            memberId = authService.getMemberIdFromAuthentication();
        } catch (Exception e) {
            // Optionally log it: logger.debug("Guest access to challenge detail");
        }
        return challengeRepository.findChallengeDetailByIdAndMemberId(challengeId, memberId);
    }

    @Override
    @Transactional
    public String leaveChallenge(Long challengeId) {
        Member member = getCurrentMember();
        Challenge challenge = getChallenge(challengeId);


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
        challengeMemberRepository.findHostByChallengeId(challenge.getId())
                .ifPresent(cm -> {
                    cm.setIsParticipate(request.getIsParticipate());
                    challengeMemberRepository.save(cm);
                });
        challengeRepository.save(challenge);
        return "Thử thách đã được cập nhật thành công.";
    }

    @Override
    public List<ChallengeSummaryDTO> getCompletedChallenges() {
        Long memberId = authService.getMemberIdFromAuthentication();

        List<ChallengeMember> completed = challengeMemberRepository
                .findFinishedChallengesByMemberIdOrderByChallengeEndDateDesc(memberId);

        return completed.stream()
                .map(cm -> {
                    Challenge challenge = cm.getChallenge();
                    Double avgRating = challengeStarRatingRepository.findAverageStarByChallengeId(challenge.getId());

                    return new ChallengeSummaryDTO(
                            challenge.getId(),
                            challenge.getName(),
                            challenge.getBanner(),
                            challenge.getPicture(),
                            cm.getRole().name(), // assuming enum Role
                            avgRating != null ? avgRating : 0.0
                    );
                })
                .collect(Collectors.toList());
    }


    @Override
    public ChallengeStatisticDTO getChallengeStatistics(Long challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found"));

        int totalParticipants = challengeRepository.countParticipants(challengeId);
        Long totalGroups = groupChallengeRepository
                .countByChallengeAndStatus(challenge, GroupChallengeStatus.ONGOING);;

        int totalEvidence = evidenceRepository.countAllEvidence(challengeId);
        int approvedEvidence = evidenceRepository.countApprovedEvidence(challengeId);
        int pendingEvidence = evidenceRepository.countPendingEvidence(challengeId);
        int rejectedEvidence = evidenceRepository.countRejectedEvidence(challengeId);

        int evidenceToday = evidenceRepository.countEvidenceToday(challengeId);
        int reviewToday = evidenceReportRepository.countPendingReviews(challengeId);

//        int totalVotes = evidenceVoteRepository.countVotesByChallengeId(challengeId); // assume this method exists
//        Double averageRating = challengeStarRatingRepository.findAverageStar(challengeId);
//        int totalRatings = challengeStarRatingRepository.countRatings(challengeId);

        // Placeholder logic for participation/completion rate (can be refined)
        double participationRate = totalParticipants > 0 ? (double) totalEvidence / totalParticipants : 0.0;
        double completionRate = 0.0; // if needed, calculate based on full attendance logic

        return new ChallengeStatisticDTO(
                challengeId,
                challenge.getName(),
                totalParticipants,
                totalGroups,
                totalEvidence,
                approvedEvidence,
                pendingEvidence,
                rejectedEvidence,
                participationRate,
                completionRate,
                LocalDate.now(),
                evidenceToday,
                reviewToday
        );
    }

    private ChallengeResponse convertToResponse(Challenge challenge) {
        // Lấy giá trị mặc định
        Integer maxParticipants = null;
        Integer maxGroups = null;
        Integer maxMembersPerGroup = null;

        if (challenge.getParticipationType() == ParticipationType.INDIVIDUAL) {
            maxParticipants = challenge.getMaxParticipants();
        } else if (challenge.getParticipationType() == ParticipationType.GROUP) {
            maxGroups = challenge.getMaxGroups();
            maxMembersPerGroup = challenge.getMaxMembersPerGroup();
        }

        return new ChallengeResponse(
                challenge.getId(),
                challenge.getName(),
                challenge.getSummary(),
                challenge.getPicture(),
                challenge.getStartDate(),
                challenge.getEndDate(),
                challenge.getChallengeType().getName(),
                challenge.getParticipationType(),
                maxParticipants,
                maxGroups,
                maxMembersPerGroup
        );

}



    public AdminDashboardSummaryDTO getAdminDashboardSummary() {
        String creator = "admin";

        int totalCreated = challengeRepository.countByCreatedBy(creator);
        Long activeChallenges = challengeRepository.countByCreatedByAndStatus(creator, ChallengeStatus.ONGOING);
        Long totalParticipants = challengeMemberRepository.countParticipantsByAdminChallenges(creator);

        return AdminDashboardSummaryDTO.builder()
                .totalCreated((long) totalCreated)
                .activeChallenges(activeChallenges)
                .totalParticipants(totalParticipants)
                .build();
    }


    public Page<ChallengeDashboardDTO> getAdminChallengeTable(String keyword, ChallengeStatus status, Pageable pageable) {
        List<Object[]> raw = challengeRepository.findDashboardChallengesRaw("admin", keyword, status);

        List<ChallengeDashboardDTO> dtos = raw.stream()
                .map(obj -> ChallengeDashboardDTO.builder()
                        .name((String) obj[0])
                        .category((String) obj[1])
                        .members((Long) obj[2])  // Có thể chính xác hơn nếu cần dùng filter riêng
                        .reportCount((Long) obj[3])
                        .status(obj[4].toString())
                        .build())
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), dtos.size());
        return new PageImpl<>(dtos.subList(start, end), pageable, dtos.size());
    }
    @Override
    public List<ChallengeParticipationChartDTO> getAdminChallengeParticipationChart() {


        List<Object[]> raw = challengeRepository.countActiveParticipantsPerAdminChallenge("admin");

        return raw.stream()
                .map(obj -> new ChallengeParticipationChartDTO((String) obj[0], (Long) obj[1]))
                .collect(Collectors.toList());
    }

    @Override
    public Page<ChallengeMemberManagementDTO> getChallengeMembersForManagement(Long challengeId, String keyword, int page, int size) {
        Long currentMemberId = authService.getMemberIdFromAuthentication(); // 👈 Lấy ID người đang login
        Pageable pageable = PageRequest.of(page, size);
        return challengeRepository.findChallengeMembersForManagement(challengeId, keyword, currentMemberId, pageable);
    }

    @Override
    public Page<ChallengeResponse> getChallengesByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        if (status == null) {
            // Lấy tất cả challenge theo từng trạng thái
            List<Challenge> allChallenges = new ArrayList<>();
            allChallenges.addAll(challengeRepository.findByStatus(ChallengeStatus.UPCOMING));
            allChallenges.addAll(challengeRepository.findByStatus(ChallengeStatus.ONGOING));
            allChallenges.addAll(challengeRepository.findByStatus(ChallengeStatus.FINISH));

            // Sort theo startDate (nếu cần)
            allChallenges.sort(Comparator.comparing(Challenge::getStartDate));

            // Pagination thủ công
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), allChallenges.size());

            List<ChallengeResponse> content = allChallenges.subList(start, end)
                    .stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

            return new PageImpl<>(content, pageable, allChallenges.size());
        }

        Page<Challenge> challengePage = switch (status.toUpperCase()) {
            case "UPCOMING" -> challengeRepository.findByStatus(ChallengeStatus.UPCOMING, pageable);
            case "ONGOING" -> challengeRepository.findByStatus(ChallengeStatus.ONGOING, pageable);
            case "FINISHED" -> challengeRepository.findByStatus(ChallengeStatus.FINISH, pageable);
            default -> Page.empty();
        };

        return challengePage.map(this::convertToResponse);
    }


    @Override
    public Integer getMaxMembersPerGroup(Long challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found"));

        return challenge.getMaxMembersPerGroup();
    }
}
