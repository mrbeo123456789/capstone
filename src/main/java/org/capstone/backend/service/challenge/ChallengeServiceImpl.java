package org.capstone.backend.service.challenge;

import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.utils.enums.*;
import org.capstone.backend.utils.upload.FirebaseUpload;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
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
    public ChallengeServiceImpl(ChallengeRepository challengeRepository, AccountRepository accountRepository,
                                MemberRepository memberRepository, ChallengeTypeRepository challengeTypeRepository,
                                ChallengeMemberRepository challengeMemberRepository, FirebaseUpload firebaseUpload) {
        this.challengeRepository = challengeRepository;
        this.accountRepository = accountRepository;
        this.memberRepository = memberRepository;
        this.challengeTypeRepository = challengeTypeRepository;
        this.challengeMemberRepository = challengeMemberRepository;
        this.firebaseUpload = firebaseUpload;
    }

    private Challenge findChallenge(Long challengeId) {
        return challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found."));
    }

    private Member findMember(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found."));
    }

    private Member getAuthenticatedMember() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("User is not authenticated");
        }

        String username = authentication.getName();

        // Tìm tài khoản trong hệ thống
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        // Nếu là Admin thì không cần tìm Member
        if (account.getRole().equals(Role.ADMIN)) {
            return null;  // Hoặc trả về một giá trị Member đặc biệt nếu cần thiết
        }

        // Tìm Member dựa trên Account
        return memberRepository.findByAccount(account)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));
    }


    private ChallengeMember createChallengeMember(Challenge challenge, Member member, Long joinBy, ChallengeMemberStatus status) {
        ChallengeMember challengeMember = new ChallengeMember();
        challengeMember.setChallenge(challenge);
        challengeMember.setMember(member);
        challengeMember.setJoinBy(joinBy);
        challengeMember.setStatus(status);
        challengeMember.setCreatedAt(LocalDateTime.now());
        return challengeMember;
    }

    @Override
    public String joinChallenge(Long challengeId) {
        Member member = getAuthenticatedMember();
        Challenge challenge = findChallenge(challengeId);

        if (challenge.getStatus() != ChallengeStatus.APPROVED) {
            return "Challenge is not active.";
        }
        if (challenge.getChallengeMembers().size() >= challenge.getMaxParticipants()) {
            return "Challenge is full.";
        }

        ChallengeMember challengeMember = createChallengeMember(challenge, member, member.getId(), ChallengeMemberStatus.JOINED);
        challengeMemberRepository.save(challengeMember);

        return "Joined challenge successfully.";
    }



    @Override
    public String createChallenge(ChallengeRequest request, MultipartFile picture, MultipartFile banner, String username) {
        Member member = getAuthenticatedMember(); // Có thể trả về null nếu là Admin
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        boolean isAdmin = account.getRole().equals(Role.ADMIN);  // Kiểm tra xem user có quyền ADMIN không

        ChallengeType challengeType = challengeTypeRepository.findById(request.getChallengeTypeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ChallengeType not found"));

        String pictureUrl = null;
        String bannerUrl = null;

        try {
            if (picture != null && !picture.isEmpty()) {
                pictureUrl = firebaseUpload.uploadFile(picture, "ChallengePicture");
            }
            if (banner != null && !banner.isEmpty()) {
                bannerUrl = firebaseUpload.uploadFile(banner,  "ChallengeBanner");
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error uploading files: " + e.getMessage());
        }

        Long createdBy = (member != null) ? member.getId() : null;

        Challenge challenge = Challenge.builder()
                .name(request.getName())
                .description(request.getDescription())
                .rule(request.getRule())
                .privacy(request.getPrivacy())
                .status(isAdmin ? ChallengeStatus.APPROVED : ChallengeStatus.PENDING)  // Nếu là Admin thì duyệt luôn
                .verificationType(request.getVerificationType())
                .verificationMethod(request.getVerificationMethod())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .maxParticipants(request.getMaxParticipants())
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .updatedBy(createdBy != null ? createdBy : account.getId()) // Nếu là Admin thì lấy ID của Account
                .challengeType(challengeType)
                .picture(pictureUrl)
                .banner(bannerUrl)
                .build();
        challengeRepository.save(challenge);

        return "Challenge đã được tạo thành công.";
    }


    @Override
    public List<ChallengeType> getAllTypes() {
        return challengeTypeRepository.findAll();
    }

    @Override
    public String reviewChallenge(ReviewChallengeRequest request) {
        Challenge challenge = challengeRepository.findById(request.getChallengeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found."));

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
    public Page<AdminChallengesResponse> getChallenges(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return challengeRepository.findAllByPriority(pageable);
    }
    @Override
    public Page<ChallengeResponse> getApprovedChallenges(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return challengeRepository.findApprovedChallenges(pageable);
    }





}
