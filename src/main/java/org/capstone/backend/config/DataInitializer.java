package org.capstone.backend.config;

import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.utils.enums.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final ChallengeTypeRepository challengeTypeRepository;
    private final MemberRepository memberRepository;
    private final InterestRepository interestRepository;
    private final PasswordEncoder passwordEncoder;
    private final ChallengeRepository challengeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
  private  final  EvidenceRepository evidenceRepository;
  private  final  EvidenceReportRepository evidenceReportRepository;
    public DataInitializer(AccountRepository accountRepository,
                           ChallengeTypeRepository challengeTypeRepository,
                           MemberRepository memberRepository,
                           InterestRepository interestRepository,
                           PasswordEncoder passwordEncoder,
                           ChallengeRepository challengeRepository,
                           ChallengeMemberRepository challengeMemberRepository, EvidenceRepository evidenceRepository, EvidenceReportRepository evidenceReportRepository) {
        this.accountRepository = accountRepository;
        this.challengeTypeRepository = challengeTypeRepository;
        this.memberRepository = memberRepository;
        this.interestRepository = interestRepository;
        this.passwordEncoder = passwordEncoder;
        this.challengeRepository = challengeRepository;
        this.challengeMemberRepository = challengeMemberRepository;
        this.evidenceRepository = evidenceRepository;
        this.evidenceReportRepository = evidenceReportRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        seedAccountsAndMembers();
        seedChallengeTypes();
        seedInterests();
        seedChallenges();
        seedChallengeMembers();
        seedTestEvidenceAndReview();
        System.out.println("✅ Data seeding completed successfully.");
    }
   // hoặc từ Controller


    // Thêm vào phần đầu của class để dùng lại
    private final Random random = new Random();

    private void seedAccountsAndMembers() {
        if (accountRepository.count() > 0) return;

        // Tạo tài khoản Admin nhưng không tạo Member
        Account admin = new Account();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setEmail("admin@example.com");
        admin.setRole(Role.ADMIN);
        admin.setStatus(AccountStatus.ACTIVE);
        admin.setCreatedAt(randomPastDate(365)); // Random trong 1 năm gần đây
        accountRepository.save(admin);

        // Tạo các tài khoản User và Member tương ứng
        IntStream.range(1, 11).forEach(i -> {
            Account user = new Account();
            user.setUsername("user" + i);
            user.setPassword(passwordEncoder.encode("password" + i));
            user.setEmail("user" + i + "@example.com");
            user.setRole(Role.MEMBER);
            user.setStatus(AccountStatus.ACTIVE);
            user.setCreatedAt(randomPastDate(365));
            accountRepository.save(user);

            // Chỉ tạo Member cho user (KHÔNG tạo cho admin)
            Member member = new Member();
            member.setFullName("User " + i);
            member.setFirstName("User");
            member.setLastName(String.valueOf(i));
            member.setPhone("098765432" + i);
            member.setAddress("123 User Street " + i);
            member.setDistrict("User District");
            member.setWard("User Ward");
            member.setDateOfBirth(LocalDate.of(2000, Math.min(i, 12), Math.min(i, 28)));
            member.setCreatedAt(randomPastDate(365));
            member.setUpdatedAt(LocalDateTime.now());
            member.setAccount(user);
            memberRepository.save(member);
        });

        System.out.println("✅ Seeded accounts and members (Admin has no member record).");
    }


    // Hàm tạo ngày ngẫu nhiên trong quá khứ
    private LocalDateTime randomPastDate(int maxDays) {
        int randomDays = random.nextInt(maxDays + 1); // Giá trị từ 0 đến maxDays
        return LocalDateTime.now().minusDays(randomDays);
    }

    private void seedChallengeTypes() {
        if (challengeTypeRepository.count() > 0) return;

        ChallengeType fitness = ChallengeType.builder()
                .name("Fitness")
                .description("Challenge liên quan đến hoạt động thể dục, thể thao.")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ChallengeType learning = ChallengeType.builder()
                .name("Learning")
                .description("Challenge liên quan đến học tập và phát triển kỹ năng.")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        challengeTypeRepository.saveAll(List.of(fitness, learning));
    }

    private void seedInterests() {
        if (interestRepository.count() > 0) return;

        List<String> names = List.of("Sports", "Music", "Coding", "Reading", "Gaming", "Traveling", "Cooking");
        List<Interest> interests = names.stream()
                .map(name -> {
                    Interest interest = new Interest();
                    interest.setName(name);
                    return interest;
                }).collect(Collectors.toList());

        interestRepository.saveAll(interests);
    }

    private void seedChallenges() {
        if (challengeRepository.count() > 0) return;

        ChallengeType fitnessType = challengeTypeRepository.findAll().stream()
                .filter(ct -> ct.getName().equals("Fitness"))
                .findFirst().orElse(null);

        if (fitnessType != null) {
            Challenge sample = Challenge.builder()
                    .name("30-Day Pushup Challenge")
                    .description("Thử thách hít đất 30 ngày liên tục")
                    .challengeType(fitnessType)
                    .privacy(PrivacyStatus.PUBLIC)
                    .status(ChallengeStatus.ONGOING)
                    .verificationType(VerificationType.CROSS_CHECK)
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusDays(30))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            challengeRepository.save(sample);
        }
    }

    private void seedChallengeMembers() {
        if (challengeMemberRepository.count() > 0) return;

        List<Member> members = memberRepository.findAll();
        List<Challenge> challenges = challengeRepository.findAll();

        if (members.size() < 3 || challenges.isEmpty()) return;

        Member host = members.get(0);
        Member coHost = members.get(1);
        List<Member> fullMembers = members.subList(2, members.size());

        for (Challenge challenge : challenges) {
            // Thêm độ trễ ngẫu nhiên để tránh tất cả tham gia vào cùng một thời điểm
            addRandomDelay();

            // Gán host
            challengeMemberRepository.save(
                    ChallengeMember.builder()
                            .challenge(challenge)
                            .member(host)
                            .role(ChallengeRole.HOST)
                            .status(ChallengeMemberStatus.JOINED)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build());

            // Gán co-host
            challengeMemberRepository.save(
                    ChallengeMember.builder()
                            .challenge(challenge)
                            .member(coHost)
                            .role(ChallengeRole.CO_HOST)
                            .status(ChallengeMemberStatus.JOINED)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build());

            // Gán full members
            for (Member member : fullMembers) {
                addRandomDelay(); // Thêm độ trễ cho từng thành viên
                challengeMemberRepository.save(
                        ChallengeMember.builder()
                                .challenge(challenge)
                                .member(member)
                                .role(ChallengeRole.MEMBER)
                                .status(ChallengeMemberStatus.JOINED)
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build());
            }
        }

        System.out.println("✅ Seeded challenge members with random delays.");
    }

    // Hàm thêm độ trễ ngẫu nhiên
    private void addRandomDelay() {
        try {
            // Độ trễ ngẫu nhiên từ 100ms đến 500ms
            int delay = 100 + new Random().nextInt(400);
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }


    private void seedTestEvidenceAndReview() {
        List<Challenge> challenges = challengeRepository.findAll();
        List<Member> members = memberRepository.findAll();

        if (challenges.isEmpty() || members.size() < 3) return;

        for (Challenge challenge : challenges) {
            for (int i = 2; i < members.size(); i++) { // Bỏ Host & Co-Host, chỉ lấy Member
                Member submitter = members.get(i);
                Member reviewer = members.get(1); // Mặc định Co-Host làm reviewer

                // Tạo evidence cho từng member
                Evidence evidence = Evidence.builder()
                        .challenge(challenge)
                        .member(submitter)
                        .evidenceUrl("https://example.com/test-video-" + submitter.getId() + ".mp4")
                        .status(EvidenceStatus.PENDING)
                        .submittedAt(LocalDateTime.now().minusDays(new Random().nextInt(30)))
                        .updatedAt(LocalDateTime.now())
                        .build();
                evidenceRepository.save(evidence);
            }
        }

        System.out.println("✅ Seeded evidence for each member and assigned Co-Host as reviewer.");
    }


}
