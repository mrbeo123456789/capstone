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

// import giữ nguyên

@Configuration
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

    private final Random random = new Random();

    public DataInitializer(
            AccountRepository accountRepository,
            ChallengeTypeRepository challengeTypeRepository,
            MemberRepository memberRepository,
            InterestRepository interestRepository,
            PasswordEncoder passwordEncoder,
            ChallengeRepository challengeRepository,
            ChallengeMemberRepository challengeMemberRepository,
            EvidenceRepository evidenceRepository,
            EvidenceReportRepository evidenceReportRepository
    ) {
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
    public void run(String... args) {
        seedAccountsAndMembers();
        seedChallengeTypes();
        seedInterests();
        seedChallenges();
        seedChallengeMembers();
        seedTestEvidenceAndReview();
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
                    .firstName("User")
                    .lastName(String.valueOf(i))
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

        interestRepository.saveAll(List.of("Sports", "Music", "Coding", "Reading", "Gaming", "Traveling", "Cooking")
                .stream().map(name -> {
                    Interest interest = new Interest();
                    interest.setName(name);
                    return interest;
                }).collect(Collectors.toList()));
    }

    private void seedChallenges() {
        if (challengeRepository.count() > 0) return;

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
            addRandomDelay();

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
                addRandomDelay();
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

        System.out.println("✅ Seeded challenge members with random delays.");
    }
    private void seedTestEvidenceAndReview() {
        List<Challenge> challenges = challengeRepository.findAll();
        List<Member> members = memberRepository.findAll();

        if (challenges.isEmpty() || members.size() < 3) return;

        for (Challenge challenge : challenges) {
            for (int i = 2; i < members.size(); i++) { // Skip Host & Co-Host
                Member submitter = members.get(i);
                Member reviewer = members.get(1); // Co-Host là reviewer

                Evidence evidence = Evidence.builder()
                        .challenge(challenge)
                        .member(submitter)
                        .evidenceUrl("https://example.com/test-video-" + submitter.getId() + ".mp4")
                        .status(EvidenceStatus.PENDING)
                        .submittedAt(LocalDateTime.now().minusDays(random.nextInt(30)))
                        .updatedAt(LocalDateTime.now())
                        .build();
                evidenceRepository.save(evidence);

                EvidenceReport report = EvidenceReport.builder()
                        .evidence(evidence)
                        .reviewer(reviewer)
                        .feedback("Nội dung đạt yêu cầu.")
                        .isApproved(true)
                        .updatedBy(reviewer.getId()) // hoặc null nếu chưa hỗ trợ updatedBy logic
                        .build();
                evidenceReportRepository.save(report);
            }
        }

        System.out.println("✅ Seeded evidence and reviews (Co-Host as reviewer, new structure).");
    }

    private LocalDateTime randomPastDate(int maxDays) {
        return LocalDateTime.now().minusDays(random.nextInt(maxDays + 1));
    }

    private void addRandomDelay() {
        try {
            Thread.sleep(100 + random.nextInt(400));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
