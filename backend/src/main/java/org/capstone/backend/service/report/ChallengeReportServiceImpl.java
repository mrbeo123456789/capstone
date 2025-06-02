package org.capstone.backend.service.report;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.challenge.ChallengeReportCountDTO;
import org.capstone.backend.dto.report.ChallengeReportRequestDTO;
import org.capstone.backend.dto.report.ChallengeReportResponseDTO;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeReport;
import org.capstone.backend.entity.Member;
import org.capstone.backend.repository.ChallengeReportRepository;
import org.capstone.backend.repository.ChallengeRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.ReportStatus;
import org.capstone.backend.utils.enums.ReportType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChallengeReportServiceImpl implements ChallengeReportService {

    private final ChallengeReportRepository challengeReportRepository;
    private final ChallengeRepository challengeRepository;
    private final MemberRepository memberRepository;
    private final AuthService authService;

    @Override
    @Transactional
    public void reportChallenge(ChallengeReportRequestDTO dto) {
        Challenge challenge = challengeRepository.findById(dto.getChallengeId())
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thử thách.")
                );
        Member member = memberRepository.findById(authService.getMemberIdFromAuthentication())
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên.")
                );

        ChallengeReport report = ChallengeReport.builder()
                .challenge(challenge)
                .reporter(member)
                .reportType(dto.getReportType())
                .content(dto.getContent())
                .build();

        challengeReportRepository.save(report);
    }

    @Override
    public Page<ChallengeReportResponseDTO> filterReports(String type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        ReportType reportType = (type == null || type.isBlank())
                ? null
                : ReportType.valueOf(type.toUpperCase());

        return challengeReportRepository.filterReportsForAdmin(reportType, pageable);
    }


    @Override
    @Transactional
    public void updateReportStatus(Long reportId, ReportStatus newStatus) {
        ChallengeReport report = challengeReportRepository.findById(reportId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy báo cáo.")
                );
        report.setStatus(newStatus);
    }
@Override
    public List<ChallengeReportCountDTO> getReportCountsByChallenge() {
        String creator = "admin";

        List<Object[]> result = challengeRepository. countReportsOfAdminChallenges(creator);
        return result.stream()
                .map(obj -> new ChallengeReportCountDTO((String) obj[0], (Long) obj[1]))
                .collect(Collectors.toList());
    }
}
