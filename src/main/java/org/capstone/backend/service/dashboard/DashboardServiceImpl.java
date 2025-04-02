package org.capstone.backend.service.dashboard;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.dashboard.DashboardResponseDTO;
import org.capstone.backend.dto.dashboard.GrowthDataDTO;
import org.capstone.backend.repository.ChallengeReportRepository;
import org.capstone.backend.repository.ChallengeRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.utils.enums.ChallengeStatus;
import org.capstone.backend.utils.enums.ReportStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final MemberRepository memberRepository;
    private final ChallengeRepository challengeRepository;
    private final ChallengeReportRepository reportRepository;

    @Override
    public DashboardResponseDTO getSummary() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastMonth = now.minusMonths(1);
        LocalDateTime prevMonth = now.minusMonths(2);

        Long currentMembers = memberRepository.countNewMembersBetween(lastMonth, now);
        Long prevMembers = memberRepository.countNewMembersBetween(prevMonth, lastMonth);

        Long currentChallenges = challengeRepository.countNewChallengesBetween(lastMonth, now);
        Long prevChallenges = challengeRepository.countNewChallengesBetween(prevMonth, lastMonth);

        double memberGrowth = prevMembers == 0 ? 100.0 : ((currentMembers - prevMembers) * 100.0 / prevMembers);
        double challengeGrowth = prevChallenges == 0 ? 100.0 : ((currentChallenges - prevChallenges) * 100.0 / prevChallenges);

        List<Object[]> statusList = challengeRepository.countChallengesByStatus();
        Map<String, Long> statusMap = statusList.stream()
                .collect(Collectors.toMap(o -> o[0].toString(), o -> (Long) o[1]));

        return DashboardResponseDTO.builder()
                .totalMembers(memberRepository.count())
                .memberGrowthRate(memberGrowth)
                .activeChallenges(challengeRepository.countByStatus(ChallengeStatus.ONGOING))
                .challengeGrowthRate(challengeGrowth)
                .pendingReports(reportRepository.countByStatus(ReportStatus.PENDING))
                .challengeStatusCounts(statusMap)
                .build();
    }

    @Override
    public GrowthDataDTO getGrowthChart(String range) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate;

        switch (range.toUpperCase()) {
            case "WEEK" -> startDate = now.minusWeeks(1);
            case "YEAR" -> startDate = now.minusYears(1);
            case "ALL" -> startDate = now.minusYears(10);
            default -> startDate = now.minusMonths(1);
        }

        List<Object[]> memberStats = memberRepository.countNewMembersGroupedByDate(startDate, now);
        List<Object[]> challengeStats = challengeRepository.countNewChallengesGroupedByDate(startDate, now);

        // ✅ Sửa lỗi ép kiểu: o[0] là Date, không phải String
        Map<String, Integer> memberMap = memberStats.stream().collect(Collectors.toMap(
                o -> o[0].toString(), // ✅ chuyển thành chuỗi bằng toString()
                o -> ((Long) o[1]).intValue()
        ));

        Map<String, Integer> challengeMap = challengeStats.stream().collect(Collectors.toMap(
                o -> o[0].toString(), // ✅ tương tự
                o -> ((Long) o[1]).intValue()
        ));

        List<String> dates = Stream.concat(memberMap.keySet().stream(), challengeMap.keySet().stream())
                .distinct().sorted().toList();

        List<Integer> newMembers = dates.stream().map(d -> memberMap.getOrDefault(d, 0)).toList();
        List<Integer> newChallenges = dates.stream().map(d -> challengeMap.getOrDefault(d, 0)).toList();

        return GrowthDataDTO.builder()
                .dates(dates)
                .newMembers(newMembers)
                .newChallenges(newChallenges)
                .build();
    }

}