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

    private void seedAccountsAndMembers() {
        if (accountRepository.count() > 0) return;

        // Admin
        Account admin = new Account();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setEmail("admin@example.com");
        admin.setRole(Role.ADMIN);
        admin.setStatus(AccountStatus.ACTIVE);
        admin.setCreatedAt(LocalDateTime.now());
        accountRepository.save(admin);

        Member adminMember = new Member();
        adminMember.setFullName("Admin User");
        adminMember.setFirstName("Admin");
        adminMember.setLastName("User");
        adminMember.setPhone("0123456789");
        adminMember.setAddress("123 Admin Street");
        adminMember.setCity("Admin City");
        adminMember.setDistrict("Admin District");
        adminMember.setWard("Admin Ward");
        adminMember.setDateOfBirth(LocalDate.of(1990, 1, 1));
        adminMember.setCreatedAt(LocalDateTime.now());
        adminMember.setUpdatedAt(LocalDateTime.now());
        adminMember.setAccount(admin);
        memberRepository.save(adminMember);

        // Users
        IntStream.range(1, 11).forEach(i -> {
            Account user = new Account();
            user.setUsername("user" + i);
            user.setPassword(passwordEncoder.encode("password" + i));
            user.setEmail("user" + i + "@example.com");
            user.setRole(Role.MEMBER);
            user.setStatus(AccountStatus.ACTIVE);
            user.setCreatedAt(LocalDateTime.now());
            accountRepository.save(user);

            Member member = new Member();
            member.setFullName("User " + i);
            member.setFirstName("User");
            member.setLastName(String.valueOf(i));
            member.setPhone("098765432" + i);
            member.setAddress("123 User Street " + i);
            member.setCity("User City");
            member.setDistrict("User District");
            member.setWard("User Ward");
            member.setDateOfBirth(LocalDate.of(2000, Math.min(i, 12), Math.min(i, 28)));
            member.setCreatedAt(LocalDateTime.now());
            member.setUpdatedAt(LocalDateTime.now());
            member.setAccount(user);
            memberRepository.save(member);
        });
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
        Member member = members.get(2);

        for (Challenge challenge : challenges) {
            challengeMemberRepository.save(
                    ChallengeMember.builder()
                            .challenge(challenge)
                            .member(host)
                            .role(ChallengeRole.HOST)
                            .status(ChallengeMemberStatus.JOINED)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build());

            challengeMemberRepository.save(
                    ChallengeMember.builder()
                            .challenge(challenge)
                            .member(coHost)
                            .role(ChallengeRole.CO_HOST)
                            .status(ChallengeMemberStatus.JOINED)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build());

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
    private void seedTestEvidenceAndReview() {
        List<Challenge> challenges = challengeRepository.findAll();
        List<Member> members = memberRepository.findAll();

        if (challenges.isEmpty() || members.size() < 3) return;

        Challenge challenge = challenges.get(0); // lấy thử thách đầu tiên
        Member submitter = members.get(2);       // member
        Member reviewer = members.get(1);        // co-host

        // Tạo evidence mới
        Evidence evidence = Evidence.builder()
                .challenge(challenge)
                .member(submitter)
                .evidenceUrl("https://example.com/test-video.mp4")
                .status(EvidenceStatus.PENDING)
                .submittedAt(LocalDateTime.of(2025, 3, 29, 10, 0)) // ✅ ngày 29/03/2025 lúc 10:00 sáng
                .updatedAt(LocalDateTime.now())
                .build();

        evidenceRepository.save(evidence);


        // Gán người chấm
        EvidenceReport report = EvidenceReport.builder()
                .evidence(evidence)
                .reviewer(reviewer)
                .build();
        evidenceReportRepository.save(report);

        System.out.println("✅ Seeded one evidence and reviewer assignment.");
    }

}
