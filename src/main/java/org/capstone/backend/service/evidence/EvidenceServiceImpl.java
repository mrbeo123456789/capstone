package org.capstone.backend.service.evidence;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.utils.enums.ChallengeMemberStatus;
import org.capstone.backend.utils.enums.EvidenceStatus;
import org.capstone.backend.utils.enums.Role;
import org.capstone.backend.utils.upload.FirebaseUpload;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EvidenceServiceImpl implements EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final MemberRepository memberRepository;
    private final ChallengeRepository challengeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final EvidenceReportRepository evidenceReportRepository;
    private final FirebaseUpload firebaseStorageService;
    private  final AccountRepository accountRepository;
    @Override
    public Evidence uploadAndSubmitEvidence(MultipartFile file, Long challengeId) throws IOException {
        String fileUrl = firebaseStorageService.uploadFile(file);
        Long memberId = getAuthenticatedMember().getId();
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new EntityNotFoundException("Challenge not found"));

        boolean isParticipant = challengeMemberRepository.existsByChallengeIdAndMemberIdAndStatus(
                challengeId, memberId, ChallengeMemberStatus.JOINED);

        if (!isParticipant) {
            throw new IllegalStateException("Bạn không tham gia thử thách này.");
        }

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        boolean existsTodayEvidence = evidenceRepository
                .existsByMemberIdAndChallengeIdAndSubmittedAtBetweenAndStatusIn(
                        memberId, challengeId, startOfDay, endOfDay,
                        List.of(EvidenceStatus.PENDING, EvidenceStatus.APPROVED));

        if (existsTodayEvidence) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã nộp bằng chứng hôm nay rồi.");
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        Evidence evidence = Evidence.builder()
                .challenge(challenge)
                .member(member)
                .evidenceUrl(fileUrl)
                .status(EvidenceStatus.PENDING)
                .build();

        evidence = evidenceRepository.save(evidence);

        Member reviewer = selectReviewer(challengeId, memberId);

        if (reviewer == null) {
            return evidence; // Không tìm được reviewer → giữ trạng thái PENDING
        }

        EvidenceReport report = EvidenceReport.builder()
                .evidence(evidence)
                .reviewer(reviewer)
                .build();

        evidenceReportRepository.save(report);

        return evidence;
    }

    private Member selectReviewer(Long challengeId, Long excludeMemberId) {
        List<Member> reviewers = challengeMemberRepository.findMembersByChallengeIdExceptUser(challengeId, excludeMemberId);

        if (reviewers.isEmpty()) {
            return null;
        }

        reviewers.sort(Comparator
                .comparingInt(this::getReviewCount)
                .thenComparing(Member::getUpdatedAt, Comparator.reverseOrder()));

        return reviewers.get(0);
    }

    private int getReviewCount(Member member) {
        return evidenceReportRepository.countByReviewerId(member.getId());
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

}
