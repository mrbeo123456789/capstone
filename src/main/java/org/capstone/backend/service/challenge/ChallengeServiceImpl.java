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
    private final MemberRepository memberRepository;
    private final ChallengeTypeRepository challengeTypeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final FirebaseUpload firebaseUpload;
    private final AuthService authService;
    private final ApplicationEventPublisher eventPublisher;
    private final EvidenceVoteRepository evidenceVoteRepository;
    private final GroupChallengeRepository groupChallengeRepository;
    private final GroupRepository groupRepository;

    // Lấy thông tin member hiện tại (nếu có)
    private Member getCurrentMember() {
        Long memberId = authService.getMemberIdFromAuthentication();
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));
    }

    // Lấy Challenge theo id
    private Challenge findChallenge(Long challengeId) {
        return challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found."));
    }

    // Upload file nếu có (dùng Firebase)
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
     * Thêm Host (người tạo) vào challenge.
     * Dùng cho Member tạo challenge.
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
     * Thêm một thành viên khác vào challenge với vai trò MEMBER.
     * Nếu groupId != null thì đó là việc join qua group.
     */
    protected void addParticipantAsChallengeMember(Challenge challenge, Member member, Long groupId) {
        // Nếu đã tồn tại bản ghi cho member này trong challenge
        // kiểm tra trạng thái, nếu là KICKED thì không cho tham gia lại.
        challengeMemberRepository.findByChallengeIdAndMemberId(challenge.getId(), member.getId()).ifPresent(existing -> {
            if (existing.getStatus() == ChallengeMemberStatus.KICKED) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Bạn đã bị kick khỏi thử thách và không thể tham gia lại.");
            } else {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Thành viên đã tham gia thử thách này rồi.");
            }
        });

        // Nếu chưa có bản ghi nào, tạo mới
        ChallengeMember challengeMember = ChallengeMember.builder()
                .challenge(challenge)
                .member(member)
                .role(ChallengeRole.MEMBER)
                .status(ChallengeMemberStatus.JOINED)
                .groupId(groupId) // null đối với tham gia cá nhân
                .joinBy(member.getId())
                .createdAt(LocalDateTime.now())
                .build();
        challengeMemberRepository.save(challengeMember);
    }

    // ============================
    // Các phương thức public của Service
    // ============================

    /**
     * Cho Member tham gia thử thách (join cá nhân).
     * Chỉ cho phép nếu thử thách có trạng thái UPCOMING và chưa đầy.
     */
    @Override
    public String joinChallenge(Long challengeId) {
        Member member = getCurrentMember();
        Challenge challenge = findChallenge(challengeId);

        if (challenge.getStatus() != ChallengeStatus.UPCOMING) {
            return "Challenge is not currently available for joining.";
        }

        if (challenge.getChallengeMembers().size() >= challenge.getMaxParticipants()) {
            return "Challenge is full.";
        }

        addParticipantAsChallengeMember(challenge, member, null);

        eventPublisher.publishEvent(
                new AchievementTriggerEvent(member.getId(), AchievementTriggerEvent.TriggerType.JOIN_CHALLENGE)
        );
        return "Joined challenge successfully.";
    }

    /**
     * Tạo thử thách.
     * Nếu có memberId (Member tạo) thì thêm bản ghi ChallengeMember với vai trò HOST.
     * Nếu không có memberId (Admin tạo) thì chỉ lưu Challenge.
     */
    @Override
    public String createChallenge(ChallengeRequest request, MultipartFile picture, MultipartFile banner) {
        Long memberId = authService.getMemberIdFromAuthentication();
        boolean isMember = (memberId != null);

        ChallengeType challengeType = challengeTypeRepository.findById(request.getChallengeTypeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ChallengeType not found"));

        String pictureUrl = uploadImageIfPresent(picture);
        String bannerUrl = uploadImageIfPresent(banner);

        Challenge challenge = Challenge.builder()
                .name(request.getName())
                .description(request.getDescription())
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
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));
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

    /**
     * Phê duyệt/trả về trạng thái của thử thách dựa trên ngày tháng.
     */
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

    /**
     * Toggle role Co-Host cho một thành viên trong thử thách.
     * Quyền thực hiện:
     * - Nếu là Admin (memberId == null) được toggle luôn.
     * - Nếu là Member, thì phải là Host của thử thách.
     */
    @Override
    @Transactional
    public void toggleCoHost(Long challengeId, Long targetMemberId) {
        Long currentMemberId = authService.getMemberIdFromAuthentication();
        boolean isAdmin = (currentMemberId == null);

        // Nếu không phải Admin thì phải xác định người thực hiện có phải Host hay không
        if (!isAdmin) {
            ChallengeMember hostMember = challengeMemberRepository.findHostByChallengeId(challengeId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Thử thách không có Host."));
            if (!hostMember.getMember().getId().equals(currentMemberId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền thay đổi role Co-Host.");
            }
        }

        ChallengeMember targetMember = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, targetMemberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thành viên không tham gia thử thách."));
        ChallengeRole newRole = (targetMember.getRole() == ChallengeRole.CO_HOST)
                ? ChallengeRole.MEMBER
                : ChallengeRole.CO_HOST;
        challengeMemberRepository.updateRole(challengeId, targetMemberId, newRole);
    }

    /**
     * Lấy danh sách challenge cho Admin (sử dụng phân trang và query theo tên & trạng thái).
     */
    public Page<AdminChallengesResponse> getChallenges(String name, ChallengeStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return challengeRepository.findAllByStatusAndPriority(name, status, pageable);
    }

    /**
     * Lấy danh sách challenge đã được phê duyệt, chưa được join bởi thành viên.
     */
    @Override
    public Page<ChallengeResponse> getApprovedChallenges(int page, int size) {
        Long memberId = authService.getMemberIdFromAuthentication();
        Pageable pageable = PageRequest.of(page, size);
        return challengeRepository.findApprovedChallengesNotJoined(memberId, pageable);
    }

    /**
     * Lấy danh sách challenge liên quan đến một member theo role (Host, Member, v.v...).
     */
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

    /**
     * Cho phép nhóm tham gia thử thách.
     * Kiểm tra các điều kiện:
     * - Thử thách phải ở trạng thái UPCOMING.
     * - Group chưa tham gia thử thách nào đang Ongoing.
     * - Đủ chỗ cho toàn bộ thành viên của group.
     * - Không có thành viên nào của group đã tham gia thử thách (qua group khác).
     */
    @Override
    @Transactional
    public String joinGroupToChallenge(Long groupId, Long challengeId) {
        Groups group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found."));
        Challenge challenge = findChallenge(challengeId);

        if (challenge.getStatus() != ChallengeStatus.UPCOMING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Challenge is not available for group joining.");
        }

        if (groupChallengeRepository.existsByGroupAndStatus(group, GroupChallengeStatus.ONGOING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Group has already joined a challenge.");
        }

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
                    .map(Member::getFullName)
                    .collect(Collectors.joining(", "));
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Một số thành viên đã tham gia thử thách qua group khác: " + memberNames);
        }

        for (Member member : groupMembers) {
            addParticipantAsChallengeMember(challenge, member, groupId);
            eventPublisher.publishEvent(
                    new AchievementTriggerEvent(member.getId(), AchievementTriggerEvent.TriggerType.JOIN_CHALLENGE)
            );
        }

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

    /**
     * Lấy chi tiết challenge cho Member.
     */
    @Override
    public ChallengeDetailResponse getChallengeDetail(Long challengeId) {
        Long memberId = authService.getMemberIdFromAuthentication();
        return challengeRepository.findChallengeDetailByIdAndMemberId(challengeId, memberId);
    }
    @Override
    @Transactional
    public String leaveChallenge(Long challengeId) {
        Member member = getCurrentMember();
        Challenge challenge = findChallenge(challengeId);

        if (challenge.getStatus() != ChallengeStatus.UPCOMING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể rời thử thách khi đã bắt đầu hoặc đã kết thúc.");
        }

        ChallengeMember challengeMember = challengeMemberRepository.findByChallengeIdAndMemberId(challenge.getId(), member.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bạn không tham gia thử thách này."));
        challengeMember.setStatus(ChallengeMemberStatus.LEFT);
        challengeMemberRepository.save(challengeMember);
        return "Bạn đã rời khỏi thử thách thành công.";
    }
    /**
     * Cho phép huỷ thử thách (cancel) nếu thử thách chưa bắt đầu (UPCOMING).
     * Quyền huỷ: Admin hoặc Host của thử thách.
     */
    @Override
    @Transactional
    public String cancelChallenge(Long challengeId) {
        Long memberId = authService.getMemberIdFromAuthentication();
        boolean isAdmin = (memberId == null);
        Challenge challenge = findChallenge(challengeId);

        if (challenge.getStatus() != ChallengeStatus.UPCOMING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ có thể huỷ thử thách khi nó chưa bắt đầu.");
        }

        if (!isAdmin) {
            ChallengeMember hostMember = challengeMemberRepository.findHostByChallengeId(challengeId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Thử thách này không có Host."));
            if (!hostMember.getMember().getId().equals(memberId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền huỷ thử thách này.");
            }
        }

        challenge.setStatus(ChallengeStatus.CANCELED);
        challengeRepository.save(challenge);
        return "Thử thách đã được huỷ thành công.";
    }

    /**
     * Cho phép một member rời thử thách nếu thử thách chưa bắt đầu (UPCOMING).
     * Thay vì xóa record, chỉ cập nhật status = LEFT để lưu lịch sử.
     */
    @Override
    @Transactional
    public String kickMemberFromChallenge(Long challengeId, Long targetMemberId) {
        // Lấy thông tin của người thực hiện (caller) từ authentication.
        // Nếu memberId == null ⇒ caller là Admin.
        Long currentMemberId = authService.getMemberIdFromAuthentication();
        boolean isAdmin = (currentMemberId == null);

        // Lấy bản ghi của target (thành viên cần kick) từ thử thách.
        ChallengeMember targetRecord = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, targetMemberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thành viên không tham gia thử thách."));

        // Nếu caller không phải Admin (tức caller là Member), ta tiến hành kiểm tra quyền:
        if (!isAdmin) {
            // Lấy bản ghi của caller trong thử thách.
            ChallengeMember callerRecord = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, currentMemberId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không tham gia thử thách."));

            // Không cho phép tự kick mình.
            if (currentMemberId.equals(targetMemberId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn không thể kick chính mình.");
            }

            ChallengeRole callerRole = callerRecord.getRole();
            ChallengeRole targetRole = targetRecord.getRole();

            // Quy tắc:
            // - Nếu caller là HOST: được kick nếu target là CO_HOST hoặc MEMBER.
            // - Nếu caller là CO_HOST: chỉ được kick nếu target có vai trò MEMBER.
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

        // Nếu đến đây, quyền kick đã hợp lệ (Admin luôn được phép).
        // Cập nhật trạng thái thành LEFT để lưu lại lịch sử.
        targetRecord.setStatus(ChallengeMemberStatus.KICKED);
        challengeMemberRepository.save(targetRecord);
        return "Thành viên đã bị kick khỏi thử thách thành công.";
    }


}
