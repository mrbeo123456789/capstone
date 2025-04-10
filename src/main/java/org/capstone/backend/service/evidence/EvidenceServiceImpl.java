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
import org.springframework.scheduling.annotation.Async;
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
import java.util.*;
import java.util.stream.Collectors;

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
    public void uploadAndSubmitEvidence(MultipartFile file, Long challengeId) throws IOException {
        Long memberId = authService.getMemberIdFromAuthentication();
        System.out.println(">>> memberId: " + memberId);

        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new EntityNotFoundException("Challenge not found"));
        System.out.println(">>> Challenge: " + challenge.getId() + ", Start: " + challenge.getStartDate() + ", End: " + challenge.getEndDate());

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        System.out.println(">>> Today: " + today + ", Time now: " + now);

        if (today.isBefore(challenge.getStartDate()) || today.isAfter(challenge.getEndDate())) {
            System.out.println(">>> OUTSIDE challenge date range");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hôm nay không nằm trong thời gian thử thách.");
        }

        if (today.equals(challenge.getEndDate()) && now.isAfter(LocalTime.of(21, 0))) {
            System.out.println(">>> Today is the last day and it's past 21:00");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn chỉ được nộp bằng chứng trước 21:00 trong ngày cuối.");
        }

        boolean isParticipant = challengeMemberRepository.existsByChallengeIdAndMemberIdAndStatus(
                challengeId, memberId, ChallengeMemberStatus.JOINED);
        System.out.println(">>> isParticipant: " + isParticipant);
        if (!isParticipant) {
            throw new IllegalStateException("Bạn không tham gia thử thách này.");
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));
        System.out.println(">>> Member loaded: " + member.getId());

        // ✅ Tránh dùng DATE() → dùng range từ 00:00 đến < 00:00 ngày mai
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        List<Evidence> todayEvidences = evidenceRepository
                .findTodayEvidence(memberId, challengeId, startOfDay, endOfDay);

        Evidence todayEvidence = null;

        if (!todayEvidences.isEmpty()) {
            // Nếu nhiều bản ghi → dùng bản đầu tiên hoặc throw error
            if (todayEvidences.size() > 1) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Có nhiều bằng chứng đã nộp trong hôm nay. Vui lòng liên hệ admin.");
            }
            todayEvidence = todayEvidences.get(0);
        }


        String path = String.format("evidences/challenge_%d/member_%d/%s/%s.mp4",
                challengeId, memberId, today, System.currentTimeMillis());
        System.out.println(">>> Upload path: " + path);

        String fileUrl = firebaseStorageService.uploadFileWithOverwrite(file, path);
        System.out.println(">>> Uploaded file URL: " + fileUrl);

        if (todayEvidence != null) {
            todayEvidence.setEvidenceUrl(fileUrl);
            todayEvidence.setUpdatedAt(LocalDateTime.now());
            System.out.println(">>> Updating existing evidence ID: " + todayEvidence.getId());
            evidenceRepository.save(todayEvidence);
            return;
        }

        Evidence newEvidence = Evidence.builder()
                .challenge(challenge)
                .member(member)
                .evidenceUrl(fileUrl)
                .status(EvidenceStatus.PENDING)
                .submittedAt(LocalDateTime.now())
                .build();
        Evidence savedEvidence = evidenceRepository.save(newEvidence);
        System.out.println(">>> Created new evidence ID: " + savedEvidence.getId());
    }

    @Override
    @Transactional
    public void reviewEvidence(EvidenceReviewRequest request) {
        Long reviewerId = authService.getMemberIdFromAuthentication();

        Evidence evidence = evidenceRepository.findById(request.getEvidenceId())
                .orElseThrow(() -> new EntityNotFoundException("Evidence not found"));

        EvidenceReport report = evidenceReportRepository.findByEvidenceId(evidence.getId())
                .orElseThrow(() -> new IllegalArgumentException("Không có người chấm cho bằng chứng này."));

        boolean isReviewer = report.getReviewer().getId().equals(reviewerId);

        // Kiểm tra người gọi có phải Host/Co-host
        ChallengeRole callerRole = challengeMemberRepository
                .findByChallengeIdAndMemberId(evidence.getChallenge().getId(), reviewerId)
                .map(ChallengeMember::getRole)
                .orElse(null);

        boolean isHostOrCoHost = callerRole == ChallengeRole.HOST || callerRole == ChallengeRole.CO_HOST;

        boolean isAlreadyReviewed = report.getIsApproved() != null;

        if (isAlreadyReviewed) {
            if (!isHostOrCoHost) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền sửa bằng chứng đã chấm.");
            }

            // Kiểm tra role của người đã chấm đầu
            ChallengeRole originalReviewerRole = challengeMemberRepository
                    .findByChallengeIdAndMemberId(evidence.getChallenge().getId(), report.getReviewer().getId())
                    .map(ChallengeMember::getRole)
                    .orElse(ChallengeRole.MEMBER);

            if (originalReviewerRole != ChallengeRole.MEMBER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không thể sửa nếu người chấm đầu là Host/Co-host.");
            }
        } else {
            // Lần đầu chấm → chỉ Reviewer hoặc Host/Co-host mới được
            if (!isReviewer && !isHostOrCoHost) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không được phép chấm bằng chứng này.");
            }
        }

        // ✅ Check thời gian được phép chấm
        LocalDate submittedDate = evidence.getSubmittedAt().toLocalDate();
        LocalTime now = LocalTime.now();
        LocalDate today = LocalDate.now();
        boolean isEndDate = submittedDate.equals(evidence.getChallenge().getEndDate());

        boolean isTooEarlyToReview =
                (!isEndDate && today.isBefore(submittedDate.plusDays(1))) ||
                        (isEndDate && today.equals(submittedDate) && now.isBefore(LocalTime.of(21, 0)));

        if (isTooEarlyToReview) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chưa đến thời gian được chấm bằng chứng.");
        }

        // ✅ Cập nhật trạng thái evidence
        evidence.setStatus(request.getIsApproved() ? EvidenceStatus.APPROVED : EvidenceStatus.REJECTED);
        evidence.setUpdatedAt(LocalDateTime.now());
        evidence.setUpdatedBy(reviewerId);

        // ✅ Cập nhật report
        report.setIsApproved(request.getIsApproved());
        report.setFeedback(request.getFeedback());
        report.setReviewedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());
        report.setUpdatedBy(reviewerId);

        evidenceRepository.save(evidence);
        evidenceReportRepository.save(report);

        // ✅ Gửi mail cho người nộp
        try {
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
                    request.getFeedback() != null ? request.getFeedback() : "Không có"
            );

            fixedGmailService.sendEmail(toEmail, subject, body);
        } catch (Exception ex) {
            System.err.println("❌ Lỗi gửi mail: " + ex.getMessage());
        }
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

        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new EntityNotFoundException("Challenge not found"));

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime endDateStart = challenge.getEndDate().atTime(21, 0);
        LocalDateTime endDateEnd = challenge.getEndDate().atTime(23, 59, 59);

        Page<Evidence> evidencePage = evidenceRepository.findAllowedEvidenceForHost(
                challengeId,
                todayStart,
                endDateStart,
                endDateEnd,
                pageable
        );

        return evidencePage.map(e -> {
            boolean canEdit = Optional.ofNullable(e.getEvidenceReports())
                    .orElse(List.of())
                    .stream()
                    .map(EvidenceReport::getReviewer)
                    .map(Member::getId)
                    .map(reviewerId -> challengeMemberRepository
                            .findByChallengeIdAndMemberId(challengeId, reviewerId)
                            .map(ChallengeMember::getRole)
                            .orElse(ChallengeRole.MEMBER)
                    )
                    .anyMatch(role -> role == ChallengeRole.MEMBER);

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
    public List<EvidenceToReviewDTO> getMySubmittedEvidencesByChallenge(Long challengeId) {
        Long memberId = authService.getMemberIdFromAuthentication();

        List<Evidence> evidences = evidenceRepository.findByMemberIdAndChallengeIdOrderBySubmittedAtAsc(memberId, challengeId);

        return evidences.stream().map(e -> new EvidenceToReviewDTO(
                e.getId(),
                e.getMember().getId(),
                e.getMember().getFullName(),
                e.getEvidenceUrl(),
                e.getStatus(),
                false,
                e.getSubmittedAt()
        )).collect(Collectors.toList());
    }

    public void assignPendingReviewersForChallenge(Long challengeId) {
        List<Evidence> evidences = evidenceRepository
                .findAllUnassignedEvidenceByChallengeOrderBySubmittedAtAsc(challengeId);

        for (Evidence e : evidences) {
            Long submitterId = e.getMember().getId();
            Member reviewer = selectReviewer(challengeId, submitterId);
            if (reviewer != null) {
                EvidenceReport report = EvidenceReport.builder()
                        .evidence(e)
                        .reviewer(reviewer)
                        .build();
                evidenceReportRepository.save(report);
            }
        }
    }

    private Member selectReviewer(Long challengeId, Long excludeMemberId) {

        // Lấy danh sách thành viên eligible và chỉ chọn những người có số lượng review dưới 3
        List<Member> eligible = challengeMemberRepository
                .findMembersByChallengeIdExceptUser(challengeId, excludeMemberId)
                .stream()
                .filter(member -> {
                    int reviewCount = getReviewCount(member);
                    System.out.println("Member " + member.getId() + " có review count: " + reviewCount);
                    return reviewCount < 3;
                })
                .toList();


        if (eligible.isEmpty()) {
            System.out.println("Không tìm thấy eligible member nào cho challenge " + challengeId + " khi loại trừ member " + excludeMemberId);
            return null;
        }

        // Nhóm theo số lượng review
        Map<Integer, List<Member>> groupedByReviewCount = eligible.stream()
                .collect(Collectors.groupingBy(this::getReviewCount));


        int minReviewCount = groupedByReviewCount.keySet().stream().min(Integer::compareTo).orElse(0);

        List<Member> leastReviewers = groupedByReviewCount.get(minReviewCount);

        // Nhóm tiếp theo theo ngày tham gia challenge
        Map<LocalDateTime, List<Member>> groupedByJoinDate = leastReviewers.stream()
                .collect(Collectors.groupingBy(m -> {
                    LocalDateTime joinDate = getJoinDateInChallenge(challengeId, m.getId());
                    System.out.println("Member " + m.getId() + " có ngày join: " + joinDate);
                    return joinDate;
                }));

        LocalDateTime earliestJoinDate = groupedByJoinDate.keySet().stream().min(LocalDateTime::compareTo).orElse(null);
        List<Member> earliestJoiners = groupedByJoinDate.get(earliestJoinDate);

        // Nếu còn nhiều hơn 1 thành viên, chọn ngẫu nhiên 1
        return earliestJoiners.get(new Random().nextInt(earliestJoiners.size()));
    }

    private int getReviewCount(Member member) {
        return evidenceReportRepository.countByReviewerId(member.getId());
    }

    private LocalDateTime getJoinDateInChallenge(Long challengeId, Long memberId) {
        return challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, memberId)
                .map(ChallengeMember::getCreatedAt)
                .orElse(LocalDateTime.MAX);
    }

    public double getApprovedEvidencePercentage(Long memberId, Long challengeId) {
        long total = evidenceRepository.countTotalEvidence(memberId, challengeId);
        if (total == 0) {
            return 0.0;
        }
        long approved = evidenceRepository.countApprovedEvidence(memberId, challengeId, EvidenceStatus.APPROVED);
        return (approved * 100.0) / total;
    }
}
