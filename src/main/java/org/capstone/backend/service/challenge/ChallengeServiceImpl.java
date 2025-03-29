package org.capstone.backend.service.challenge;

import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.*;
import org.capstone.backend.utils.upload.FirebaseUpload;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
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

    public ChallengeServiceImpl(
            ChallengeRepository challengeRepository,
            AccountRepository accountRepository,
            MemberRepository memberRepository,
            ChallengeTypeRepository challengeTypeRepository,
            ChallengeMemberRepository challengeMemberRepository,
            FirebaseUpload firebaseUpload,
            AuthService authService
    ) {
        this.challengeRepository = challengeRepository;
        this.accountRepository = accountRepository;
        this.memberRepository = memberRepository;
        this.challengeTypeRepository = challengeTypeRepository;
        this.challengeMemberRepository = challengeMemberRepository;
        this.firebaseUpload = firebaseUpload;
        this.authService = authService;
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
                return firebaseUpload.uploadFile(file);
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

        if (challenge.getStatus() != ChallengeStatus.APPROVED) return "Challenge is not active.";
        if (challenge.getChallengeMembers().size() >= challenge.getMaxParticipants()) return "Challenge is full.";

        ChallengeMember challengeMember = createChallengeMember(
                challenge, member, member.getId(), ChallengeMemberStatus.JOINED, ChallengeRole.MEMBER);
        challengeMemberRepository.save(challengeMember);

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
                .rule(request.getRule())
                .privacy(request.getPrivacy())
                .status(member == null ? ChallengeStatus.APPROVED : ChallengeStatus.PENDING) // ✅ Duyệt tự động nếu là admin
                .verificationType(request.getVerificationType())
                .verificationMethod(request.getVerificationMethod())
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

    @Override
    public Page<AdminChallengesResponse> getChallenges(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return challengeRepository.findAllByPriority(pageable);
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
        return challengeRepository.findChallengesByMemberAndRole(memberId, role);
    }

    @Override
    public ChallengeDetailResponse getChallengeDetail(Long challengeId) {
        Long memberId = authService.getMemberIdFromAuthentication();
        return challengeRepository.findChallengeDetailByIdAndMemberId(challengeId, memberId);
    }
}
