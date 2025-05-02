package org.capstone.backend.config;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.utils.enums.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;
@Transactional
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final ChallengeTypeRepository challengeTypeRepository;
    private final MemberRepository memberRepository;
    private final InterestRepository interestRepository;
    private final PasswordEncoder passwordEncoder;
    private final ChallengeRepository challengeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final EvidenceRepository evidenceRepository;
    private final EvidenceReportRepository evidenceReportRepository;
    private final AchievementRepository achievementRepository;
    // Repository dành cho Group và GroupChallenge
    private final GroupRepository groupRepository;
    private final GroupChallengeRepository groupChallengeRepository;

    private final Random random = new Random();



    @Override
    public void run(String... args) {
        seedAccountsAndMembers();
        seedChallengeTypes();
        seedInterests();
      // seedChallenges();
        //seedChallengeMembers();
       //seedGroups();              // Seed cho Groups nếu chưa có dữ liệu
       // seedGroupChallenges();     // Seed cho GroupChallenge
     //  seedTestEvidenceAndReview();
        seedAchievements(); // ← THÊM DÒNG NÀY

        System.out.println("✅ Data seeding completed successfully.");
    }

    private void seedAccountsAndMembers() {
        if (accountRepository.count() > 0) return;

        accountRepository.save(Account.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .email("admin@example.com")
                .role(Role.ADMIN)
                .status(AccountStatus.ACTIVE)
                .createdAt(randomPastDate(365))
                .build());

        IntStream.rangeClosed(1, 10).forEach(i -> {
            Account user = accountRepository.save(Account.builder()
                    .username("user" + i)
                    .password(passwordEncoder.encode("password" + i))
                    .email("user" + i + "@example.com")
                    .role(Role.MEMBER)
                    .status(AccountStatus.ACTIVE)
                    .createdAt(randomPastDate(365))
                    .build());

            memberRepository.save(Member.builder()
                    .fullName("User " + i)
//                    .firstName("User")
//                    .lastName(String.valueOf(i))
                    .phone("098765432" + i)
                    .address("123 User Street " + i)
                    .district("User District")
                    .ward("User Ward")
                    .invitePermission(InvitePermission.EVERYONE)
                    .dateOfBirth(LocalDate.of(2000, Math.min(i, 12), Math.min(i, 28)))
                    .createdAt(randomPastDate(365))
                    .updatedAt(LocalDateTime.now())
                    .account(user)
                    .build());
        });

        System.out.println("✅ Seeded accounts and members (Admin has no member record).");
    }

    private void seedChallengeTypes() {
        if (challengeTypeRepository.count() > 0) return;

        challengeTypeRepository.saveAll(List.of(
                ChallengeType.builder()
                        .name("Fitness")
                        .description("Challenge liên quan đến hoạt động thể dục, thể thao.")
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),
                ChallengeType.builder()
                        .name("Learning")
                        .description("Challenge liên quan đến học tập và phát triển kỹ năng.")
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()
        ));
    }

    private void seedInterests() {
        if (interestRepository.count() > 0) return;

        interestRepository.saveAll(
                Stream.of("Sports", "Music", "Coding", "Reading", "Gaming", "Traveling", "Cooking").map(name -> {
                            Interest interest = new Interest();
                            interest.setName(name);
                            interest.isActive();
                            return interest;
                        }).collect(Collectors.toList())
        );
    }

    private void seedChallenges() {
        if (challengeRepository.count() > 0) return;

        // Giả sử chỉ seed thử thách cho loại Fitness
        challengeTypeRepository.findAll().stream()
                .filter(ct -> ct.getName().equals("Fitness"))
                .findFirst()
                .ifPresent(fitnessType -> {
                    Challenge challenge = Challenge.builder()
                            .name("30-Day Pushup Challenge")
                            .description("Thử thách hít đất 30 ngày liên tục")
                            .challengeType(fitnessType)
                            .privacy(PrivacyStatus.PUBLIC)
                            .status(ChallengeStatus.ONGOING)
                            .verificationType(VerificationType.MEMBER_REVIEW)
                            .participationType(ParticipationType.INDIVIDUAL)
                            .startDate(LocalDate.now())
                            .endDate(LocalDate.now().plusDays(30))
                            .createdBy("SYSTEM") // 👈 THÊM DÒNG NÀY
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    challengeRepository.save(challenge);
                });
    }

    private void seedChallengeMembers() {
        if (challengeMemberRepository.count() > 0) return;

        List<Member> members = memberRepository.findAll();
        List<Challenge> challenges = challengeRepository.findAll();
        if (members.size() < 3 || challenges.isEmpty()) return;

        Member host = members.get(0);
        Member coHost = members.get(1);
        List<Member> participants = members.subList(2, members.size());

        for (Challenge challenge : challenges) {
            challengeMemberRepository.saveAll(List.of(
                    ChallengeMember.builder()
                            .challenge(challenge)
                            .member(host)
                            .role(ChallengeRole.HOST)
                            .status(ChallengeMemberStatus.JOINED)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build(),
                    ChallengeMember.builder()
                            .challenge(challenge)
                            .member(coHost)
                            .role(ChallengeRole.CO_HOST)
                            .status(ChallengeMemberStatus.JOINED)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build()
            ));

            participants.forEach(member -> {
                challengeMemberRepository.save(
                        ChallengeMember.builder()
                                .challenge(challenge)
                                .member(member)
                                .role(ChallengeRole.MEMBER)
                                .status(ChallengeMemberStatus.JOINED)
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build());
            });
        }

        System.out.println("✅ Seeded challenge members.");
    }

    // Seed Groups nếu chưa có dữ liệu (giả định groups được tạo từ các member)
    private void seedGroups() {
        if (groupRepository.count() > 0) return;

        // Ví dụ: tạo 3 nhóm, mỗi nhóm gồm 3 thành viên ngẫu nhiên
        List<Member> allMembers = memberRepository.findAll();
        if (allMembers.size() < 9) return;

        for (int i = 1; i <= 3; i++) {
            // Chọn ngẫu nhiên 3 thành viên
            List<Member> groupMembers = allMembers.subList((i - 1) * 3, i * 3);
            Groups group = Groups.builder()
                    .name("Group " + i)
                    .createdAt(LocalDateTime.now())
                    .build();
            Groups savedGroup = groupRepository.save(group);

            // Giả sử entity Groups có quan hệ one-to-many với GroupMember
            // Và bạn đã có repository GroupMemberRepository để lưu mối quan hệ
            // Nếu Groups entity tự quản lý danh sách thành viên, bạn có thể set:
            List<GroupMember> groupMemberList = groupMembers.stream()
                    .map(member -> GroupMember.builder()
                            .group(savedGroup)
                            .member(member)
                            .role("MEMBER")
                            .status(GroupMemberStatus.ACTIVE)
                            .createdAt(LocalDateTime.now())
                            .build())
                    .collect(Collectors.toList());
            savedGroup.setMembers(groupMemberList);
            groupRepository.save(savedGroup);
        }
        System.out.println("✅ Seeded groups and group members.");
    }

    // Seed GroupChallenge: liên kết Group tham gia thử thách
    private void seedGroupChallenges() {
        if (groupChallengeRepository.count() > 0) return;

        // Lấy tất cả các group đã có
        List<Groups> groups = groupRepository.findAll();
        List<Challenge> challenges = challengeRepository.findAll();

        // Ví dụ: mỗi group sẽ tham gia thử thách đầu tiên có trạng thái UPCOMING (nếu có)
        for (Groups group : groups) {
            List<GroupMember> groupMemberList = group.getMembers();
            if (groupMemberList == null || groupMemberList.isEmpty()) continue;
            Challenge upcomingChallenge = challenges.stream()
                    .filter(c -> c.getStatus() == ChallengeStatus.UPCOMING)
                    .findFirst()
                    .orElse(null);
            if (upcomingChallenge != null) {
                GroupChallenge groupChallenge = GroupChallenge.builder()
                        .group(group)
                        .challenge(upcomingChallenge)
                        .joinDate(LocalDateTime.now())
                        .status(GroupChallengeStatus.ONGOING)
                        .createdAt(LocalDateTime.now())
                        .build();
                groupChallengeRepository.save(groupChallenge);
            }
        }
        System.out.println("✅ Seeded group challenges.");
    }

    private void seedTestEvidenceAndReview() {
        List<Challenge> challenges = challengeRepository.findAll();
        List<Member> members = memberRepository.findAll();
        if (challenges.isEmpty() || members.size() < 3) return;

        Challenge challenge = challenges.get(0); // chỉ dùng challenge đầu tiên
        Member reviewer = members.get(1); // Co-Host làm reviewer

        for (int i = 2; i < members.size(); i++) { // bỏ qua Host & Co-Host
            Member submitter = members.get(i);

            Evidence evidence = Evidence.builder()
                    .challenge(challenge)
                    .member(submitter)
                    .evidenceUrl("https://example.com/test-video-" + submitter.getId() + ".mp4")
                    .status(EvidenceStatus.PENDING)
                    .submittedAt(LocalDateTime.now().minusDays(1))
                    .updatedAt(LocalDateTime.now())
                    .build();
            evidenceRepository.save(evidence);


        }

        System.out.println("✅ Seeded 1 evidence per user.");
    }

    private void seedAchievements() {
        if (achievementRepository.count() > 0) return;

        List<Achievement> achievements = List.of(
                // SINGLE_CONDITION (7)
                new Achievement(null, AchievementType.FIRST_TRY, AchievementCategory.SINGLE_CONDITION, "First Try", "Tham gia thử thách đầu tiên", false),
                new Achievement(null, AchievementType.DAILY_WARRIOR, AchievementCategory.SINGLE_CONDITION, "Daily Warrior", "Nộp bằng chứng trong 1 ngày bất kỳ", false),
                new Achievement(null, AchievementType.PROFILE_MASTER, AchievementCategory.SINGLE_CONDITION, "All Set!", "Cập nhật hồ sơ cá nhân đầy đủ", false),
                new Achievement(null, AchievementType.INVITER, AchievementCategory.SINGLE_CONDITION, "Inviter", "Gửi lời mời thành công cho 1 người", false),
                new Achievement(null, AchievementType.REVIEWER, AchievementCategory.SINGLE_CONDITION, "Reviewer", "Chấm 1 bằng chứng của người khác", false),
                new Achievement(null, AchievementType.PERFECT_ACCURACY, AchievementCategory.SINGLE_CONDITION, "Perfect Accuracy", "Đạt 100% bằng chứng được duyệt trong 1 thử thách", false),
                new Achievement(null, AchievementType.COMEBACK_SUBMITTER, AchievementCategory.SINGLE_CONDITION, "Comeback Submitter", "Nộp bài trở lại sau hơn 7 ngày không hoạt động", false),

                // CUMULATIVE (5)
                new Achievement(null, AchievementType.RISING_STAR, AchievementCategory.CUMULATIVE, "Rising Star", "Tham gia 5 thử thách", true),
                new Achievement(null, AchievementType.ACTIVE_VOTER, AchievementCategory.CUMULATIVE, "Active Voter", "Chấm 10 bằng chứng", true),
                new Achievement(null, AchievementType.GROUP_HERO, AchievementCategory.CUMULATIVE, "Group Hero", "Thắng 10 trận nhóm", true),
                new Achievement(null, AchievementType.CONTRIBUTOR, AchievementCategory.CUMULATIVE, "Contributor", "Đăng 20 bằng chứng", true),
                new Achievement(null, AchievementType.STREAK_TRIPLE, AchievementCategory.CUMULATIVE, "Challenger", "Hoàn thành 3 thử thách liên tiếp không bỏ ngày nào", true),

                // TIME_BASED (4)
                new Achievement(null, AchievementType.STREAK_MASTER, AchievementCategory.TIME_BASED, "Streak Master", "Nộp bằng chứng 30 ngày liên tiếp", true),
                new Achievement(null, AchievementType.NIGHT_OWL, AchievementCategory.TIME_BASED, "Night Owl", "Nộp bằng chứng sau 10h tối", false),
                new Achievement(null, AchievementType.EARLY_BIRD, AchievementCategory.TIME_BASED, "Early Bird", "Nộp bằng chứng trước 7h sáng", false),
                new Achievement(null, AchievementType.LONG_HAUL, AchievementCategory.TIME_BASED, "Long Haul", "Hoàn thành 3 thử thách kéo dài hơn 14 ngày", true),

                // RANKING_BASED (4)
                new Achievement(null, AchievementType.FITNESS_CHAMPION, AchievementCategory.RANKING_BASED, "Fitness Champion", "Vào top 10 bảng xếp hạng thử thách", false),
                new Achievement(null, AchievementType.GROUP_LEGEND, AchievementCategory.RANKING_BASED, "Group Legend", "Nhóm đứng đầu bảng xếp hạng", false),
                new Achievement(null, AchievementType.CONSISTENT_TOPPER, AchievementCategory.RANKING_BASED, "Consistent Topper", "Vào top 3 trong 3 thử thách liên tiếp", true),
                new Achievement(null, AchievementType.UNDERDOG, AchievementCategory.RANKING_BASED, "Underdog to Top", "Từ cuối bảng lên top 10 trong 1 thử thách", false)
        );

        achievementRepository.saveAll(achievements);
        System.out.println("✅ Seeded achievements.");
    }

    private LocalDateTime randomPastDate(int maxDays) {
        return LocalDateTime.now().minusDays(random.nextInt(maxDays + 1));
    }
}
