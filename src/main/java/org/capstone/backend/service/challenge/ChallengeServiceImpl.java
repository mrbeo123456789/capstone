package org.capstone.backend.service.challenge;

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
    public ChallengeServiceImpl(
            ChallengeRepository challengeRepository,
            AccountRepository accountRepository,
            MemberRepository memberRepository,
            ChallengeTypeRepository challengeTypeRepository,
            ChallengeMemberRepository challengeMemberRepository,
            FirebaseUpload firebaseUpload,
            AuthService authService, ApplicationEventPublisher eventPublisher, EvidenceVoteRepository evidenceVoteRepository
    ) {
        this.challengeRepository = challengeRepository;
        this.accountRepository = accountRepository;
        this.memberRepository = memberRepository;
        this.challengeTypeRepository = challengeTypeRepository;
        this.challengeMemberRepository = challengeMemberRepository;
        this.firebaseUpload = firebaseUpload;
        this.authService = authService;
        this.eventPublisher = eventPublisher;
        this.evidenceVoteRepository = evidenceVoteRepository;
    }

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

    private ChallengeMember createChallengeMember(Challenge challenge, Member member, Long joinBy, ChallengeMemberStatus status, ChallengeRole role) {
        return ChallengeMember.builder()
                .challenge(challenge)
                .member(member)
                .role(role)
                .status(status)
                .joinBy(joinBy)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Override
    public String joinChallenge(Long challengeId) {
        Member member = getCurrentMember();
        Challenge challenge = findChallenge(challengeId);

        // Chỉ cho phép tham gia nếu thử thách đang ở trạng thái ONGOING
        if (challenge.getStatus() != ChallengeStatus.UPCOMING) {
            return "Challenge is not currently available for joining.";
        }

        // Kiểm tra thử thách có đủ chỗ không
        if (challenge.getChallengeMembers().size() >= challenge.getMaxParticipants()) {
            return "Challenge is full.";
        }

        // Tạo bản ghi tham gia thử thách
        ChallengeMember challengeMember = createChallengeMember(
                challenge, member, member.getId(), ChallengeMemberStatus.JOINED, ChallengeRole.MEMBER);
        challengeMemberRepository.save(challengeMember);
        eventPublisher.publishEvent(
                new AchievementTriggerEvent(member.getId(), AchievementTriggerEvent.TriggerType.JOIN_CHALLENGE)
        );
        return "Joined challenge successfully.";
    }

    @Override
    public String createChallenge(ChallengeRequest request, MultipartFile picture, MultipartFile banner) {
        Long memberId = authService.getMemberIdFromAuthentication(); // null nếu là admin
        Member member = null;
        Account account;

        if (memberId == null) {
            // 👉 Admin mặc định có ID = 1
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
                .status(member == null ? ChallengeStatus.APPROVED : ChallengeStatus.PENDING) // ✅ Duyệt tự động nếu là admin
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

        // ✅ Nếu là member, tự động trở thành HOST
        if (member != null) {
            ChallengeMember challengeMember = createChallengeMember(
                    challenge, member, member.getId(), ChallengeMemberStatus.JOINED, ChallengeRole.HOST);
            challengeMemberRepository.save(challengeMember);
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
                // Nếu đã kết thúc thì chuyển thành CANCELED
                status = ChallengeStatus.CANCELED;
            } else if (challenge.getStartDate().isAfter(now)) {
                // Nếu chưa bắt đầu thì chuyển thành UPCOMING
                status = ChallengeStatus.UPCOMING;
            } else {
                // Nếu đang diễn ra thì chuyển thành ONGOING
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
                remainingDays = ChronoUnit.DAYS.between(today, c.getStartDate()); // nếu có startDate
            } else if (c.getStatus() == ChallengeStatus.ONGOING) {
                remainingDays = ChronoUnit.DAYS.between(today, c.getEndDate());
            } else if (c.getStatus() == ChallengeStatus.FINISH) {
                avgVotes = evidenceVoteRepository.getAverageScoreByMemberInChallenge(memberId,c.getId()); // tùy bạn xử lý
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
    public ChallengeDetailResponse getChallengeDetail(Long challengeId) {
        Long memberId = authService.getMemberIdFromAuthentication();
        return challengeRepository.findChallengeDetailByIdAndMemberId(challengeId, memberId);
    }
}
