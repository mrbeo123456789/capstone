package org.capstone.backend.service.evidence;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.evidence.EvidenceReviewRequest;
import org.capstone.backend.dto.evidence.EvidenceToReviewDTO;
import org.capstone.backend.dto.evidence.TaskChecklistDTO;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeMember;
import org.capstone.backend.entity.Evidence;
import org.capstone.backend.entity.EvidenceReport;
import org.capstone.backend.entity.Member;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.entity.GroupMember;
import org.capstone.backend.repository.ChallengeMemberRepository;
import org.capstone.backend.repository.ChallengeRepository;
import org.capstone.backend.repository.EvidenceReportRepository;
import org.capstone.backend.repository.EvidenceRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.ChallengeMemberStatus;
import org.capstone.backend.utils.enums.ChallengeRole;
import org.capstone.backend.utils.enums.EvidenceStatus;
import org.capstone.backend.utils.sendmail.FixedGmailService;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvidenceServiceImpl implements EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final MemberRepository memberRepository;
    private final ChallengeRepository challengeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final EvidenceReportRepository evidenceReportRepository;
    private final FirebaseUpload firebaseStorageService;
    private final AuthService authService;
    private final FixedGmailService fixedGmailService;

    /**
     * Upload và nộp bằng chứng cho thử thách.
     *
     * @param file        file bằng chứng được upload
     * @param challengeId ID của thử thách
     * @throws IOException nếu lỗi upload file
     */
    @Override
    public void uploadAndSubmitEvidence(MultipartFile file, Long challengeId) throws IOException {
        Long memberId = authService.getMemberIdFromAuthentication();

        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new EntityNotFoundException("Challenge not found"));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // Kiểm tra ngày nộp có nằm trong khoảng thời gian của thử thách không
        if (today.isBefore(challenge.getStartDate()) || today.isAfter(challenge.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hôm nay không nằm trong thời gian thử thách.");
        }

        // Nếu ngày cuối của thử thách thì chỉ nộp trước 21:00
        if (today.equals(challenge.getEndDate()) && now.isAfter(LocalTime.of(21, 0))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn chỉ được nộp bằng chứng trước 21:00 trong ngày cuối.");
        }

        // Kiểm tra user có tham gia thử thách không
        boolean isParticipant = challengeMemberRepository.existsByChallengeIdAndMemberIdAndStatus(
                challengeId, memberId, ChallengeMemberStatus.JOINED);
        if (!isParticipant) {
            throw new IllegalStateException("Bạn không tham gia thử thách này.");
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        // Xác định khoảng thời gian của ngày hôm nay
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        List<Evidence> todayEvidences = evidenceRepository.findTodayEvidence(memberId, challengeId, startOfDay, endOfDay);
        Evidence todayEvidence = null;
        if (!todayEvidences.isEmpty()) {
            if (todayEvidences.size() > 1) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Có nhiều bằng chứng đã nộp trong hôm nay. Vui lòng liên hệ admin.");
            }
            todayEvidence = todayEvidences.get(0);
        }

        // Tạo đường dẫn upload và upload file
        String path = String.format("evidences/challenge_%d/member_%d/%s/%s.mp4",
                challengeId, memberId, today, System.currentTimeMillis());
        String fileUrl = firebaseStorageService.uploadFileWithOverwrite(file, path);

        if (todayEvidence != null) {
            todayEvidence.setEvidenceUrl(fileUrl);
            todayEvidence.setUpdatedAt(LocalDateTime.now());
            evidenceRepository.save(todayEvidence);
        } else {
            Evidence newEvidence = Evidence.builder()
                    .challenge(challenge)
                    .member(member)
                    .evidenceUrl(fileUrl)
                    .status(EvidenceStatus.PENDING)
                    .submittedAt(LocalDateTime.now())
                    .build();
            evidenceRepository.save(newEvidence);
        }
    }

    /**
     * Xử lý chấm (review) bằng chứng.
     *
     * @param request dữ liệu chấm bằng chứng bao gồm ID, phản hồi và trạng thái phê duyệt
     */
    @Override
    @Transactional
    public void reviewEvidence(EvidenceReviewRequest request) {
        Long reviewerId = authService.getMemberIdFromAuthentication();

        Evidence evidence = evidenceRepository.findById(request.getEvidenceId())
                .orElseThrow(() -> new EntityNotFoundException("Evidence not found"));

        EvidenceReport report = evidenceReportRepository.findByEvidenceId(evidence.getId())
                .orElseThrow(() -> new IllegalArgumentException("Không có người chấm cho bằng chứng này."));

        boolean isReviewer = report.getReviewer().getId().equals(reviewerId);

        // Kiểm tra quyền của người gọi (có phải Host/Co-host không)
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
            ChallengeRole originalReviewerRole = challengeMemberRepository
                    .findByChallengeIdAndMemberId(evidence.getChallenge().getId(), report.getReviewer().getId())
                    .map(ChallengeMember::getRole)
                    .orElse(ChallengeRole.MEMBER);
            if (originalReviewerRole != ChallengeRole.MEMBER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không thể sửa nếu người chấm đầu là Host/Co-host.");
            }
        } else {
            if (!isReviewer && !isHostOrCoHost) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không được phép chấm bằng chứng này.");
            }
        }

        // Kiểm tra thời gian được phép chấm bằng chứng
        LocalDate submittedDate = evidence.getSubmittedAt().toLocalDate();
        LocalTime currentTime = LocalTime.now();
        LocalDate today = LocalDate.now();
        boolean isEndDate = submittedDate.equals(evidence.getChallenge().getEndDate());
        boolean isTooEarlyToReview = (!isEndDate && today.isBefore(submittedDate.plusDays(1)))
                || (isEndDate && today.equals(submittedDate) && currentTime.isBefore(LocalTime.of(21, 0)));
        if (isTooEarlyToReview) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chưa đến thời gian được chấm bằng chứng.");
        }

        // Cập nhật trạng thái của evidence và report
        evidence.setStatus(request.getIsApproved() ? EvidenceStatus.APPROVED : EvidenceStatus.REJECTED);
        evidence.setUpdatedAt(LocalDateTime.now());
        evidence.setUpdatedBy(reviewerId);

        report.setIsApproved(request.getIsApproved());
        report.setFeedback(request.getFeedback());
        report.setReviewedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());
        report.setUpdatedBy(reviewerId);

        evidenceRepository.save(evidence);
        evidenceReportRepository.save(report);

        // Gửi email thông báo kết quả chấm bằng chứng cho người nộp
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
            // Lỗi gửi mail có thể được ghi log trong môi trường production
        }
    }

    /**
     * Lấy danh sách bằng chứng để Host/Co-host review cho thử thách.
     *
     * @param challengeId ID của thử thách
     * @param page        số trang
     * @param size        kích thước trang
     * @return một trang chứa các EvidenceToReviewDTO
     */
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
                    .orElse(Collections.emptyList())
                    .stream()
                    .map(EvidenceReport::getReviewer)
                    .map(Member::getId)
                    .map(reviewerId -> challengeMemberRepository
                            .findByChallengeIdAndMemberId(challengeId, reviewerId)
                            .map(ChallengeMember::getRole)
                            .orElse(ChallengeRole.MEMBER))
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

    /**
     * Lấy danh sách bằng chứng được giao cho reviewer (đang chờ duyệt) của thử thách.
     *
     * @param challengeId ID của thử thách
     * @return danh sách EvidenceToReviewDTO
     */
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
                            true,
                            e.getSubmittedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách bằng chứng do member tự nộp cho thử thách.
     *
     * @param challengeId ID của thử thách
     * @return danh sách EvidenceToReviewDTO
     */
    @Override
    public List<EvidenceToReviewDTO> getMySubmittedEvidencesByChallenge(Long challengeId) {
        Long memberId = authService.getMemberIdFromAuthentication();
        List<Evidence> evidences = evidenceRepository.findByMemberIdAndChallengeIdOrderBySubmittedAtAsc(memberId, challengeId);
        return evidences.stream()
                .map(e -> new EvidenceToReviewDTO(
                        e.getId(),
                        e.getMember().getId(),
                        e.getMember().getFullName(),
                        e.getEvidenceUrl(),
                        e.getStatus(),
                        false,
                        e.getSubmittedAt()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Gán tự động reviewer cho các bằng chứng chưa được gán của thử thách.
     *
     * @param challengeId ID của thử thách
     */
    public void assignPendingReviewersForChallenge(Long challengeId) {
        List<Evidence> evidences = evidenceRepository.findAllUnassignedEvidenceByChallengeOrderBySubmittedAtAsc(challengeId);
        evidences.forEach(e -> {
            Long submitterId = e.getMember().getId();
            Member reviewer = selectReviewer(challengeId, submitterId);
            if (reviewer != null) {
                EvidenceReport report = EvidenceReport.builder()
                        .evidence(e)
                        .reviewer(reviewer)
                        .build();
                evidenceReportRepository.save(report);
            }
        });
    }

    private final Random random = new Random();

    /**
     * Lựa chọn một reviewer thích hợp cho thử thách, ngoại trừ submitter.
     *
     * @param challengeId     ID của thử thách
     * @param excludeMemberId ID của submitter cần loại trừ
     * @return một Member reviewer phù hợp hoặc null nếu không tìm được
     */
    private Member selectReviewer(Long challengeId, Long excludeMemberId) {
        Long excludeGroupId = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, excludeMemberId)
                .map(ChallengeMember::getGroupId)
                .orElse(null);
        boolean isIndividualChallenge = (excludeGroupId == null);

        List<Member> eligible = challengeMemberRepository.findMembersByChallengeIdExceptUser(challengeId, excludeMemberId)
                .stream()
                .filter(member -> {
                    if (!isIndividualChallenge) {
                        Long candidateGroupId = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, member.getId())
                                .map(ChallengeMember::getGroupId)
                                .orElse(null);
                        if (excludeGroupId.equals(candidateGroupId)) {
                            return false;
                        }
                    }
                    return getReviewCount(member) < 3;
                })
                .toList();

        if (eligible.isEmpty()) {
            return null;
        }

        // Lấy các member có số review thấp nhất
        Map<Integer, List<Member>> groupedByReviewCount = eligible.stream()
                .collect(Collectors.groupingBy(this::getReviewCount));
        int minReviewCount = groupedByReviewCount.keySet().stream()
                .min(Integer::compareTo)
                .orElse(0);
        List<Member> leastReviewers = groupedByReviewCount.getOrDefault(minReviewCount, Collections.emptyList());
        if (leastReviewers.isEmpty()) {
            return null;
        }

        // Lấy các member có ngày tham gia sớm nhất
        Map<LocalDateTime, List<Member>> groupedByJoinDate = leastReviewers.stream()
                .collect(Collectors.groupingBy(m -> getJoinDateInChallenge(challengeId, m.getId())));
        LocalDateTime earliestJoinDate = groupedByJoinDate.keySet().stream()
                .filter(Objects::nonNull)
                .min(LocalDateTime::compareTo)
                .orElse(null);
        if (earliestJoinDate == null) {
            return leastReviewers.get(random.nextInt(leastReviewers.size()));
        }
        List<Member> earliestJoiners = groupedByJoinDate.getOrDefault(earliestJoinDate, Collections.emptyList());
        if (earliestJoiners.isEmpty()) {
            return leastReviewers.get(random.nextInt(leastReviewers.size()));
        }
        return earliestJoiners.get(random.nextInt(earliestJoiners.size()));
    }

    /**
     * Lấy số lượng review mà một member đã thực hiện.
     *
     * @param member đối tượng Member
     * @return số lượng review
     */
    private int getReviewCount(Member member) {
        return evidenceReportRepository.countByReviewerId(member.getId());
    }

    /**
     * Lấy ngày giờ tham gia thử thách của một member.
     *
     * @param challengeId ID của thử thách
     * @param memberId    ID của Member
     * @return thời gian tham gia thử thách hoặc LocalDateTime.MAX nếu không tìm thấy
     */
    private LocalDateTime getJoinDateInChallenge(Long challengeId, Long memberId) {
        return challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, memberId)
                .map(ChallengeMember::getCreatedAt)
                .orElse(LocalDateTime.MAX);
    }

    /**
     * Tính phần trăm bằng chứng được phê duyệt của một member trong một thử thách.
     *
     * @param memberId    ID của member
     * @param challengeId ID của thử thách
     * @return phần trăm bằng chứng được phê duyệt
     */
    public double getApprovedEvidencePercentage(Long memberId, Long challengeId) {
        long total = evidenceRepository.countTotalEvidence(memberId, challengeId);
        if (total == 0) {
            return 0.0;
        }
        long approved = evidenceRepository.countApprovedEvidence(memberId, challengeId, EvidenceStatus.APPROVED);
        return (approved * 100.0) / total;
    }

    /**
     * Lấy danh sách bằng chứng của một member trong một thử thách với phân trang.
     *
     * @param memberId    ID của member
     * @param challengeId ID của thử thách
     * @param pageable    thông tin phân trang
     * @return trang EvidenceToReviewDTO
     */
    @Override
    public Page<EvidenceToReviewDTO> getEvidenceByMemberAndChallenge(Long memberId, Long challengeId, Pageable pageable) {
        return evidenceRepository.findByMemberIdAndChallengeId(memberId, challengeId, pageable)
                .map(e -> new EvidenceToReviewDTO(
                        e.getId(),
                        e.getMember().getId(),
                        e.getMember().getFullName(),
                        e.getEvidenceUrl(),
                        e.getStatus(),
                        false,
                        e.getSubmittedAt()
                ));
    }

    public List<TaskChecklistDTO> getTasksForCurrentMonth()
    {

        Long memberId = authService.getMemberIdFromAuthentication();
        // Lấy ngày đầu và ngày cuối của tháng hiện tại
        LocalDate firstDayOfMonth = LocalDate.now().withDayOfMonth(1); // Ngày đầu tháng
        LocalDate lastDayOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()); // Ngày cuối tháng

        // Lấy tất cả thử thách của member trong tháng hiện tại có trạng thái ONGOING
        List<ChallengeMember> challengeMembers = challengeMemberRepository.findOngoingChallengesForMemberInCurrentMonth(memberId, firstDayOfMonth, lastDayOfMonth);

        // Dùng Stream để xử lý và chuyển thành TaskChecklistDTO
        List<TaskChecklistDTO> taskList = challengeMembers.stream()
                .map(cm -> {
                    Challenge challenge = cm.getChallenge();
                    Evidence evidence = evidenceRepository.findEvidenceByMemberAndChallenge(memberId, challenge.getId()).orElse(null);

                    // Tạo đối tượng TaskChecklistDTO
                    TaskChecklistDTO taskDTO = new TaskChecklistDTO();
                    taskDTO.setChallengeId(challenge.getId());
                    taskDTO.setChallengeName(challenge.getName());

                    if (evidence == null) {
                        taskDTO.setEvidenceSubmitted(false);
                        taskDTO.setMessage("Chưa nộp chứng cứ");
                    } else {
                        taskDTO.setEvidenceSubmitted(true);
                        taskDTO.setEvidenceStatus(evidence.getStatus().toString());
                        taskDTO.setEvidenceSubmitted(evidence.getStatus() == EvidenceStatus.APPROVED);

                        if (evidence.getStatus() == EvidenceStatus.APPROVED) {
                            taskDTO.setMessage("Đã phê duyệt");
                        } else {
                            taskDTO.setMessage("Chưa phê duyệt");
                        }
                    }

                    return taskDTO;
                })
                .collect(Collectors.toList());

        // Nếu không có nhiệm vụ trong tháng này
        if (taskList.isEmpty()) {
            TaskChecklistDTO noTaskDTO = new TaskChecklistDTO();
            noTaskDTO.setMessage("Không có nhiệm vụ trong tháng này.");
            taskList.add(noTaskDTO);
        }

        return taskList;
    }

}
