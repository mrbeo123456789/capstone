package org.capstone.backend.service.evidence;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.evidence.EvidenceReviewRequest;
import org.capstone.backend.dto.evidence.EvidenceStatusCountDTO;
import org.capstone.backend.dto.evidence.EvidenceToReviewDTO;
import org.capstone.backend.dto.evidence.TaskChecklistDTO;
import org.capstone.backend.dto.member.MemberSubmissionProjection;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeMember;
import org.capstone.backend.entity.Evidence;
import org.capstone.backend.entity.EvidenceReport;
import org.capstone.backend.entity.Member;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.entity.GroupMember;
import org.capstone.backend.event.EvidenceReviewedEvent;
import org.capstone.backend.repository.ChallengeMemberRepository;
import org.capstone.backend.repository.ChallengeRepository;
import org.capstone.backend.repository.EvidenceReportRepository;
import org.capstone.backend.repository.EvidenceRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.*;
import org.capstone.backend.utils.sendmail.FixedGmailService;
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
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Upload và nộp bằng chứng cho thử thách.
     *
     * @param file        file bằng chứng được upload
     * @param challengeId ID của thử thách
     * @throws ResponseStatusException nếu xảy ra lỗi (không tìm thấy thử thách, không trong thời gian thử thách, không tham gia,…)
     */
    @Override
    @Transactional
    public void uploadAndSubmitEvidence(MultipartFile file, Long challengeId) {
        Long memberId = authService.getMemberIdFromAuthentication();

        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thử thách."));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        if (today.isBefore(challenge.getStartDate()) || today.isAfter(challenge.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hôm nay không nằm trong thời gian của thử thách.");
        }

        if (today.equals(challenge.getEndDate()) && now.isAfter(LocalTime.of(21, 0))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn chỉ được nộp bằng chứng trước 21:00 trong ngày cuối.");
        }

        boolean isParticipant = challengeMemberRepository.existsByChallengeIdAndMemberIdAndStatus(
                challengeId, memberId, ChallengeMemberStatus.JOINED);
        if (!isParticipant) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không tham gia thử thách này.");
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên."));

        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        List<Evidence> todayEvidences = evidenceRepository.findTodayEvidence(memberId, challengeId, startOfDay, endOfDay);
        Evidence todayEvidence = null;
        if (!todayEvidences.isEmpty()) {
            if (todayEvidences.size() > 1) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Có nhiều bằng chứng đã nộp hôm nay. Vui lòng liên hệ quản trị viên.");
            }
            todayEvidence = todayEvidences.get(0);
        }

        try {
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
        } catch (ResponseStatusException e) {
            throw e; // Don't wrap if it's already a proper status!
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể upload bằng chứng: " + e.getMessage());
        }
    }

//    @Override
//    @Transactional
    public void reviewEvidenceNotFixed(EvidenceReviewRequest request) {
        Long reviewerId = authService.getMemberIdFromAuthentication();

        Evidence evidence = evidenceRepository.findById(request.getEvidenceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bằng chứng."));

        EvidenceReport report = evidenceReportRepository.findByEvidenceId(evidence.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không có người chấm cho bằng chứng này."));

        // Kiểm tra quyền chấm/chỉnh sửa theo nghiệp vụ đã được trích xuất
        if (!isUserAllowedToReview(evidence, report, reviewerId)) {
            if (report.getIsApproved() != null) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền sửa bằng chứng đã được chấm.");
            } else {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không được phép chấm bằng chứng này.");
            }
        }

        // Kiểm tra thời gian cho phép chấm
        checkReviewTime(evidence);

        // Cập nhật trạng thái bằng chứng và báo cáo
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

        eventPublisher.publishEvent(new EvidenceReviewedEvent(evidence, request.getIsApproved()));
    }

    // Kiểm tra xem thời gian hiện tại đã đủ cho phép chấm/chỉnh sửa hay chưa
    private boolean isTimeEligibleForReview(Evidence evidence) {
        LocalDate submittedDate = evidence.getSubmittedAt().toLocalDate();
        LocalDate today = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        boolean isEndDate = submittedDate.equals(evidence.getChallenge().getEndDate());
        // Nếu chưa đủ 1 ngày sau khi nộp (hoặc đối với ngày kết thúc, chỉ cho phép sau 21:00)
        return !((!isEndDate && today.isBefore(submittedDate.plusDays(1)))
                || (isEndDate && today.equals(submittedDate) && currentTime.isBefore(LocalTime.of(21, 0))));
    }

    // Nâng cao: Nếu không đủ thời gian thì ném exception
    private void checkReviewTime(Evidence evidence) {
        if (!isTimeEligibleForReview(evidence)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chưa đến thời gian được chấm bằng chứng.");
        }
    }

    // Kiểm tra xem một member có phải Host/Co-host hay không của một thử thách
    private boolean isUserHostOrCoHost(Long challengeId, Long memberId) {
        ChallengeRole role = challengeMemberRepository
                .findByChallengeIdAndMemberId(challengeId, memberId)
                .map(ChallengeMember::getRole)
                .orElse(null);
        return role == ChallengeRole.HOST || role == ChallengeRole.CO_HOST;
    }

    // Kiểm tra quyền chấm/chỉnh sửa bằng chứng dựa trên logic nghiệp vụ
    private boolean isUserAllowedToReview(Evidence evidence, EvidenceReport report, Long reviewerId) {
        boolean isReviewer = report.getReviewer().getId().equals(reviewerId);
        boolean isHostOrCoHost = isUserHostOrCoHost(evidence.getChallenge().getId(), reviewerId);
        boolean isAlreadyReviewed = report.getIsApproved() != null;

        if (isAlreadyReviewed) {
            // Nếu đã chấm: chỉ cho Host/Co-host được phép sửa, với điều kiện người chấm ban đầu là Member
            if (!isHostOrCoHost) {
                return false;
            }
            ChallengeRole originalReviewerRole = challengeMemberRepository
                    .findByChallengeIdAndMemberId(evidence.getChallenge().getId(), report.getReviewer().getId())
                    .map(ChallengeMember::getRole)
                    .orElse(ChallengeRole.MEMBER);
            return originalReviewerRole == ChallengeRole.MEMBER;
        } else {
            // Nếu chưa chấm: cho phép nếu là người được giao chấm hoặc Host/Co-host
            return isReviewer || isHostOrCoHost;
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
    public Page<EvidenceToReviewDTO> getEvidenceByChallengeForHost(
            Long challengeId,
            Long memberId,
            EvidenceStatus status,
            int page,
            int size) {

        Long currentReviewerId = authService.getMemberIdFromAuthentication();
        boolean isAdmin = currentReviewerId == null;

        // Lấy thông tin Challenge
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thử thách."));

        // Nếu không phải admin, kiểm tra quyền của thành viên (chỉ Host/Co-host được phép xem)
        if (!isAdmin) {
            ChallengeRole currentRole = challengeMemberRepository
                    .findByChallengeIdAndMemberId(challengeId, currentReviewerId)
                    .map(ChallengeMember::getRole)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không thuộc thử thách này."));
            if (currentRole != ChallengeRole.HOST && currentRole != ChallengeRole.CO_HOST) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ có Host/Co-host mới được quyền xem.");
            }
        }

        Pageable pageable = PageRequest.of(page, size);

        // Lấy danh sách bằng chứng theo trạng thái và giới hạn thời gian chấm (theo logic riêng repository)
        Page<Evidence> evidencePage = evidenceRepository.findAllowedEvidenceForHostByMemberIdAndStatus(
                challengeId,
                memberId, // Admin vẫn lọc theo memberId từ API
                LocalDate.now().atStartOfDay(), // todayStart
                challenge.getEndDate().atTime(21, 0), // endDateStart
                challenge.getEndDate().atTime(23, 59, 59), // endDateEnd
                status,
                pageable
        );

        return evidencePage.map(evidence -> new EvidenceToReviewDTO(
                evidence.getId(),
                evidence.getMember().getId(),
                evidence.getMember().getFullName(),
                evidence.getEvidenceUrl(),
                evidence.getStatus(),
                true, // Mặc định có thể review (hoặc bạn có thể set false nếu cần hạn chế)
                evidence.getSubmittedAt()
        ));
    }

        /**
         * Lấy danh sách bằng chứng được giao cho reviewer (đang chờ duyệt) của thử thách.
         *
         * @param challengeId ID của thử thách
         * @return danh sách EvidenceToReviewDTO
         */
//    @Override
    public List<EvidenceToReviewDTO> getEvidenceAssignedForMemberToReviewNotFixed(Long challengeId) {
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
//    public void assignPendingReviewersForChallenge(Long challengeId) {
//        List<Evidence> evidences = evidenceRepository.findAllUnassignedEvidenceByChallengeOrderBySubmittedAtAsc(challengeId);
//        evidences.forEach(e -> {
//            Long submitterId = e.getMember().getId();
//            Member reviewer = selectReviewer(challengeId, submitterId);
//            if (reviewer != null) {
//                EvidenceReport report = EvidenceReport.builder()
//                        .evidence(e)
//                        .reviewer(reviewer)
//                        .build();
//                evidenceReportRepository.save(report);
//            }
//        });
//    }

    private final Random random = new Random();

    /**
     * Lựa chọn một reviewer thích hợp cho thử thách, ngoại trừ submitter.
     *
     * @param challengeId     ID của thử thách
     * @param excludeMemberId ID của submitter cần loại trừ
     * @return một Member reviewer phù hợp hoặc null nếu không tìm được
     */
    private Member selectReviewerNotFixed(Long challengeId, Long excludeMemberId) {
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
                    return true;
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


    @Override
    public List<TaskChecklistDTO> getTasksForDate(LocalDate date) {
        Long memberId = authService.getMemberIdFromAuthentication();

        boolean isTodayOrFuture = !date.isBefore(LocalDate.now());

        List<ChallengeMember> challengeMembers = isTodayOrFuture
                ? challengeMemberRepository.findOngoingChallengesForMemberOnDate(memberId, date)
                : challengeMemberRepository.findAllChallengesForMemberOnDate(memberId, date);

        return challengeMembers.stream()
                .filter(cm -> {
                    ChallengeStatus status = cm.getChallenge().getStatus();
                    return status != ChallengeStatus.PENDING && status != ChallengeStatus.UPCOMING;
                })
                .map(cm -> {
                    Challenge challenge = cm.getChallenge();
                    Long challengeId = challenge.getId();

                    TaskChecklistDTO taskDTO = new TaskChecklistDTO();
                    taskDTO.setChallengeId(challengeId);
                    taskDTO.setChallengeName(challenge.getName());

                    evidenceRepository.findByMemberIdAndChallengeIdAndDate(memberId, challengeId, date)
                            .ifPresent(evidence -> {
                                if (evidence.getStatus() != null) {
                                    taskDTO.setEvidenceStatus(evidence.getStatus().toString());
                                }
                            });

                    if (challenge.getVerificationType() == VerificationType.MEMBER_REVIEW) {
                        List<EvidenceReport> reports =
                                evidenceReportRepository.findByReviewerIdAndChallengeIdAndAssignedDate(memberId, challengeId, date);

                        int reviewed = (int) reports.stream().filter(r -> r.getReviewedAt() != null).count();

                        taskDTO.setTotalReviewAssigned(reports.size());
                        taskDTO.setReviewCompleted(reviewed);
                    }

                    return taskDTO;
                })
                .collect(Collectors.toList());
    }

    public List<EvidenceStatusCountDTO> countEvidenceByStatusForHost(
            Long challengeId,
            Long memberId
    ) {
        // Gọi phương thức repository để lấy số lượng Evidence theo trạng thái
        return evidenceRepository.countEvidenceByStatusForHost(
                challengeId, memberId
        );
    }

    //    Đang fix đoạn sau, đây là đoạn test thuật toán mới
    @Transactional
    public void assignPendingReviewersForChallenge(Long challengeId) {
        List<Evidence> evidences = evidenceRepository.findPendingEvidenceByChallengeOrderBySubmittedAtAsc(challengeId);
        List<EvidenceReport> reportsToSave = new ArrayList<>();

        for (Evidence evidence : evidences) {
            Long evidenceId = evidence.getId();

            // Đếm tổng số reviewer đã review evidence này
            int currentReviewCount = evidenceReportRepository.countByEvidenceId(evidenceId);

            // Nếu đã đủ 3 người review thì bỏ qua
            if (currentReviewCount >= 3) {
                continue;
            }

            // Kiểm tra có report nào reviewer_id == NULL chưa
            boolean hasPendingAssignment = evidenceReportRepository.existsByEvidenceIdAndReviewerIsNull(evidenceId);
            if (hasPendingAssignment) {
                continue; // Đang có slot trống, không cần tạo thêm
            }

            // Nếu không có slot trống thì mới tạo slot mới
            EvidenceReport report = EvidenceReport.builder()
                    .evidence(evidence)
                    .createdAt(LocalDateTime.now())
                    .build();
            reportsToSave.add(report);
        }

        if (!reportsToSave.isEmpty()) {
            evidenceReportRepository.saveAll(reportsToSave);
        }
    }

    private static final int REVIEWERS_PER_EVIDENCE = 3;

    private void assignReviewersToEvidence(Long challengeId, Evidence evidence) {
        Long submitterId = evidence.getMember().getId();
        Long excludeGroupId = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, submitterId)
                .map(ChallengeMember::getGroupId)
                .orElse(null);
        boolean isIndividualChallenge = (excludeGroupId == null);

        List<Member> eligibleReviewers = challengeMemberRepository.findMembersByChallengeIdExceptUser(challengeId, submitterId)
                .stream()
                .filter(member -> {
                    if (!isIndividualChallenge) {
                        Long candidateGroupId = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, member.getId())
                                .map(ChallengeMember::getGroupId)
                                .orElse(null);
                        return !Objects.equals(excludeGroupId, candidateGroupId);
                    }
                    return true;
                })
                .collect(Collectors.toList());

        if (eligibleReviewers.isEmpty()) return;

        Map<Integer, List<Member>> reviewCountMap = eligibleReviewers.stream()
                .collect(Collectors.groupingBy(this::getReviewCount));

        int minReviewCount = reviewCountMap.keySet().stream()
                .min(Integer::compareTo)
                .orElse(0);

        List<Member> candidates = reviewCountMap.getOrDefault(minReviewCount, Collections.emptyList());

        if (candidates.isEmpty()) return;

        Collections.shuffle(candidates, new Random());

        int reviewerCount = Math.min(REVIEWERS_PER_EVIDENCE, candidates.size());

        List<Member> selectedReviewers = candidates.subList(0, reviewerCount);

        // ✅ Collect all reports first
        List<EvidenceReport> reports = selectedReviewers.stream()
                .map(reviewer -> EvidenceReport.builder()
                        .evidence(evidence)
                        .reviewer(reviewer)
                        .createdAt(LocalDateTime.now())
                        .build())
                .toList();

        // ✅ Save all at once
        evidenceReportRepository.saveAll(reports);
    }

    private Member selectReviewer(Long challengeId, Long submitterId) {
        Long submitterGroupId = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, submitterId)
                .map(ChallengeMember::getGroupId)
                .orElse(null);

        boolean isIndividual = (submitterGroupId == null);

        List<Member> eligible = challengeMemberRepository.findMembersByChallengeIdExceptUser(challengeId, submitterId)
                .stream()
                .filter(member -> {
                    if (!isIndividual) {
                        Long candidateGroupId = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, member.getId())
                                .map(ChallengeMember::getGroupId)
                                .orElse(null);
                        // must be from different groups
                        return candidateGroupId == null || !candidateGroupId.equals(submitterGroupId);
                    }
                    return true; // individual: anyone except submitter
                })
                .toList();

        if (eligible.isEmpty()) {
            return null;
        }

        return eligible.get(random.nextInt(eligible.size()));
    }

    @Override
    @Transactional
    public void reviewEvidence(EvidenceReviewRequest request) {
        Long reviewerId = authService.getMemberIdFromAuthentication();

        Evidence evidence = evidenceRepository.findById(request.getEvidenceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bằng chứng."));

        // 1. Tìm EvidenceReport chưa có reviewerId trước
        EvidenceReport report = evidenceReportRepository.findFirstByEvidenceIdAndReviewerIdIsNull(evidence.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không còn lượt review trống cho bằng chứng này."));

        // 2. Gán reviewer vào report
        report.setReviewer(Member.builder().id(reviewerId).build());
        report.setIsApproved(request.getIsApproved());
        report.setFeedback(request.getFeedback());
        report.setReviewedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());
        report.setUpdatedBy(reviewerId);

        evidenceReportRepository.save(report);

        // 3. Kiểm tra tổng số lượt review
        int approvedCount = evidenceReportRepository.countByEvidenceIdAndIsApproved(evidence.getId(), true);
        int rejectedCount = evidenceReportRepository.countByEvidenceIdAndIsApproved(evidence.getId(), false);

        if (approvedCount + rejectedCount >= 3) {
            if (approvedCount >= 2) {
                evidence.setStatus(EvidenceStatus.APPROVED);
            } else if (rejectedCount >= 2) {
                evidence.setStatus(EvidenceStatus.REJECTED);
            }
            evidence.setUpdatedAt(LocalDateTime.now());
            evidence.setUpdatedBy(reviewerId);

            evidenceRepository.save(evidence);
        }
    }


    @Override
    @Transactional(readOnly = true)
    public List<EvidenceToReviewDTO> getEvidenceAssignedForMemberToReview(Long challengeId) {
        Long reviewerId = authService.getMemberIdFromAuthentication();

        // Lấy danh sách evidenceId mà reviewer này đã từng review
        List<Long> reviewedEvidenceIds = evidenceReportRepository.findEvidenceIdsReviewedByMember(reviewerId);

        // Lấy các evidence report chưa có reviewer
        List<EvidenceReport> unassignedReports = evidenceReportRepository.findUnassignedReportsByChallenge(challengeId);

        // Lấy thông tin loại thử thách (Group hay Individual)
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thử thách."));

        boolean isGroupChallenge = challenge.getParticipationType() == ParticipationType.GROUP;

        // Nếu là group challenge, lấy groupId của reviewer
        Long reviewerGroupId = null;
        if (isGroupChallenge) {
            reviewerGroupId = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, reviewerId)
                    .map(cm -> cm.getGroupId())
                    .orElse(null);
        }

        Long finalReviewerGroupId = reviewerGroupId; // cần final để dùng trong lambda

        return unassignedReports.stream()
                .filter(report -> {
                    Evidence evidence = report.getEvidence();
                    Long submitterId = evidence.getMember().getId();

                    // Không nhận evidence mình đã review
                    if (reviewedEvidenceIds.contains(evidence.getId())) {
                        return false;
                    }

                    // Không nhận bằng chứng do mình nộp
                    if (submitterId.equals(reviewerId)) {
                        return false;
                    }

                    // Nếu là group challenge, không nhận evidence cùng group
                    if (isGroupChallenge && finalReviewerGroupId != null) {
                        Long submitterGroupId = challengeMemberRepository.findByChallengeIdAndMemberId(challengeId, submitterId)
                                .map(cm -> cm.getGroupId())
                                .orElse(null);
                        if (finalReviewerGroupId.equals(submitterGroupId)) {
                            return false;
                        }
                    }

                    return true;
                })
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

}
