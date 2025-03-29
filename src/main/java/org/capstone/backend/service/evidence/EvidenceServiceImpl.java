package org.capstone.backend.service.evidence;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.evidence.EvidenceReviewRequest;
import org.capstone.backend.dto.evidence.EvidenceToReviewDTO;
import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.ChallengeMemberStatus;
import org.capstone.backend.utils.enums.ChallengeRole;
import org.capstone.backend.utils.enums.EvidenceStatus;
import org.capstone.backend.utils.enums.Role;
import org.capstone.backend.utils.sendmail.FixedGmailService;
import org.capstone.backend.utils.upload.FirebaseUpload;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

@Service
public class EvidenceServiceImpl implements EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final MemberRepository memberRepository;
    private final ChallengeRepository challengeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final EvidenceReportRepository evidenceReportRepository;
    private final FirebaseUpload firebaseStorageService;
    private final AuthService authService;
private  final FixedGmailService fixedGmailService;
    public EvidenceServiceImpl(
            EvidenceRepository evidenceRepository,
            MemberRepository memberRepository,
            ChallengeRepository challengeRepository,
            ChallengeMemberRepository challengeMemberRepository,
            EvidenceReportRepository evidenceReportRepository,
            FirebaseUpload firebaseStorageService,
            AuthService authService, FixedGmailService fixedGmailService
    ) {
        this.evidenceRepository = evidenceRepository;
        this.memberRepository = memberRepository;
        this.challengeRepository = challengeRepository;
        this.challengeMemberRepository = challengeMemberRepository;
        this.evidenceReportRepository = evidenceReportRepository;
        this.firebaseStorageService = firebaseStorageService;
        this.authService = authService;
        this.fixedGmailService = fixedGmailService;
    }

    @Override
    public Evidence uploadAndSubmitEvidence(MultipartFile file, Long challengeId) throws IOException {
        Long memberId = authService.getMemberIdFromAuthentication();
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new EntityNotFoundException("Challenge not found"));

        boolean isParticipant = challengeMemberRepository.existsByChallengeIdAndMemberIdAndStatus(
                challengeId, memberId, ChallengeMemberStatus.JOINED);

        if (!isParticipant) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không tham gia thử thách này.");
        }

        // Check evidence tồn tại trong ngày
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        boolean existsTodayEvidence = evidenceRepository
                .existsByMemberIdAndChallengeIdAndSubmittedAtBetweenAndStatusIn(
                        memberId, challengeId, startOfDay, endOfDay,
                        List.of(EvidenceStatus.PENDING, EvidenceStatus.APPROVED));

        if (existsTodayEvidence) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã nộp bằng chứng hôm nay rồi.");
        }

        // Upload file
        String fileUrl = firebaseStorageService.uploadFile(file);

        Evidence evidence = Evidence.builder()
                .challenge(challenge)
                .member(member)
                .evidenceUrl(fileUrl)
                .status(EvidenceStatus.PENDING)
                .submittedAt(LocalDateTime.now())
                .build();

        evidence = evidenceRepository.save(evidence);

        // Gán reviewer (nếu có)
        Member reviewer = selectReviewer(challengeId, memberId);
        if (reviewer != null) {
            EvidenceReport report = EvidenceReport.builder()
                    .evidence(evidence)
                    .reviewer(reviewer)
                    .build();
            evidenceReportRepository.save(report);
        }

        return evidence;
    }

    @Override
    @Transactional
    public void reviewEvidence(EvidenceReviewRequest request) {
        Long reviewerId = authService.getMemberIdFromAuthentication();
        Member reviewer = memberRepository.findById(reviewerId)
                .orElseThrow(() -> new EntityNotFoundException("Reviewer not found"));

        Evidence evidence = evidenceRepository.findById(request.getEvidenceId())
                .orElseThrow(() -> new EntityNotFoundException("Evidence not found"));

        EvidenceReport report = evidenceReportRepository.findByEvidenceId(request.getEvidenceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không có bản chấm nào."));

        Long originalReviewerId = report.getReviewer().getId();

        // Nếu người hiện tại ≠ người chấm ban đầu → kiểm tra quyền sửa
        if (!originalReviewerId.equals(reviewerId)) {
            // 👉 Check role của người CHẤM BAN ĐẦU
            ChallengeRole originalRole = challengeMemberRepository
                    .findByChallengeIdAndMemberId(evidence.getChallenge().getId(), originalReviewerId)
                    .map(ChallengeMember::getRole)
                    .orElse(ChallengeRole.MEMBER); // fallback

            // Nếu người đầu tiên là Host/Co-host → cấm sửa
            if (originalRole == ChallengeRole.HOST || originalRole == ChallengeRole.CO_HOST) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Không thể chấm lại: Bằng chứng đã được chấm bởi Host hoặc Co-host.");
            }

            // 👉 Check role của người hiện tại
            ChallengeRole currentRole = challengeMemberRepository
                    .findByChallengeIdAndMemberId(evidence.getChallenge().getId(), reviewerId)
                    .map(ChallengeMember::getRole)
                    .orElse(null);

            if (currentRole != ChallengeRole.HOST && currentRole != ChallengeRole.CO_HOST) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền sửa kết quả đã chấm.");
            }
        }

        // ✅ Cho phép chấm / sửa chấm
        evidence.setStatus(request.getIsApproved() ? EvidenceStatus.APPROVED : EvidenceStatus.REJECTED);
        evidence.setUpdatedAt(LocalDateTime.now());
        evidence.setUpdatedBy(reviewerId);

        report.setIsApproved(request.getIsApproved());
        report.setFeedback(request.getFeedback());
        report.setReviewedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());
        report.setUpdatedBy(reviewerId);
        report.setReviewer(reviewer); // Cập nhật reviewer mới nếu sửa
// Sau khi evidence & report đã được save
        evidenceRepository.save(evidence);
        evidenceReportRepository.save(report);

// ✅ Gửi mail cho người nộp
        String toEmail = evidence.getMember().getAccount().getEmail();
        String subject = "Bằng chứng của bạn đã được chấm";
        String body = String.format("""
    Xin chào %s,

    Bằng chứng bạn đã nộp cho thử thách "%s" đã được %s.

    Trạng thái: %s
    Góp ý: %s

    Vui lòng truy cập GoBeyond để xem chi tiết.

    Trân trọng,
    Đội ngũ GoBeyond
    """,
                evidence.getMember().getFullName(),
                evidence.getChallenge().getName(),
                request.getIsApproved() ? "chấm xong" : "chấm và từ chối",
                evidence.getStatus(),
                request.getFeedback() != null ? request.getFeedback() : "Không có");

        fixedGmailService.sendEmail(toEmail, subject, body);

    }

    private Member selectReviewer(Long challengeId, Long excludeMemberId) {
        List<Member> reviewers = challengeMemberRepository.findMembersByChallengeIdExceptUser(challengeId, excludeMemberId);

        if (reviewers.isEmpty()) return null;

        return reviewers.stream().min(Comparator
                        .comparingInt(this::getReviewCount)
                        .thenComparing(Member::getUpdatedAt, Comparator.reverseOrder()))
                .orElse(null);
    }
    @Override
    public Page<EvidenceToReviewDTO> getEvidenceByChallengeForHost(Long challengeId, int page, int size) {
        Long currentReviewerId = authService.getMemberIdFromAuthentication();

        ChallengeRole currentRole = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, currentReviewerId)
                .map(ChallengeMember::getRole)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không thuộc thử thách này"));

        if (currentRole != ChallengeRole.HOST && currentRole != ChallengeRole.CO_HOST) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ Host/Co-host mới có quyền xem");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Evidence> evidencePage = evidenceRepository.findByChallengeId(challengeId, pageable);

        return evidencePage.map(e -> {
            EvidenceReport report = e.getEvidenceReport();
            boolean canEdit = false;

            if (report == null) {
                canEdit = true;
            } else {
                ChallengeRole originalReviewerRole = challengeMemberRepository
                        .findByChallengeIdAndMemberId(challengeId, report.getReviewer().getId())
                        .map(ChallengeMember::getRole)
                        .orElse(ChallengeRole.MEMBER);

                if (originalReviewerRole == ChallengeRole.MEMBER) {
                    canEdit = true;
                }
            }

            return new EvidenceToReviewDTO(
                    e.getId(),
                    e.getMember().getId(),
                    e.getMember().getFullName(),
                    e.getEvidenceUrl(),
                    e.getStatus(),
                    canEdit,
                    e.getSubmittedAt()
            );
        });
    }

    @Override
    public List<EvidenceToReviewDTO> getEvidenceAssignedForMemberToReview(Long challengeId) {
        Long reviewerId = authService.getMemberIdFromAuthentication();

        List<EvidenceReport> reports = evidenceReportRepository.findByReviewerIdAndIsApprovedIsNull(reviewerId);

        return reports.stream()
                .filter(r -> r.getEvidence().getChallenge().getId().equals(challengeId))
                .map(report -> {
                    Evidence e = report.getEvidence();
                    return new EvidenceToReviewDTO(
                            e.getId(),
                            e.getMember().getId(),
                            e.getMember().getFullName(),
                            e.getEvidenceUrl(),
                            e.getStatus(),
                            true, // canEdit
                            e.getSubmittedAt()
                    );
                }).toList();
    }

    @Override
    public Page<EvidenceToReviewDTO> getMySubmittedEvidencesPagedByChallenge(Long challengeId, int page, int size) {
        Long memberId = authService.getMemberIdFromAuthentication();
        Pageable pageable = PageRequest.of(page, size);

        Page<Evidence> evidences = evidenceRepository.findByMemberIdAndChallengeId(memberId, challengeId, pageable);

        return evidences.map(e -> new EvidenceToReviewDTO(
                e.getId(),
                e.getMember().getId(),
                e.getMember().getFullName(),
                e.getEvidenceUrl(),
                e.getStatus(),
                false,
                e.getSubmittedAt()
        ));
    }


    private int getReviewCount(Member member) {
        return evidenceReportRepository.countByReviewerId(member.getId());
    }
}
