package org.capstone.backend.config;

import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.utils.enums.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Configuration
class DataInitializer {

    private final AccountRepository accountRepository;
    private final ChallengeTypeRepository challengeTypeRepository;
    private final MemberRepository memberRepository;
    private final InterestRepository interestRepository;
    private final PasswordEncoder passwordEncoder;
    private final ChallengeRepository challengeRepository;

    private final ChallengeMemberRepository challengeMemberRepository;

    public DataInitializer(AccountRepository accountRepository,
                           ChallengeTypeRepository challengeTypeRepository,
                           MemberRepository memberRepository,
                           InterestRepository interestRepository,
                           PasswordEncoder passwordEncoder,
                           ChallengeRepository challengeRepository,
                           ChallengeMemberRepository challengeMemberRepository) {
        this.accountRepository = accountRepository;
        this.challengeTypeRepository = challengeTypeRepository;
        this.memberRepository = memberRepository;
        this.interestRepository = interestRepository;
        this.passwordEncoder = passwordEncoder;
        this.challengeRepository = challengeRepository;
        this.challengeMemberRepository = challengeMemberRepository;
    }

    @Bean
    public boolean initData() {
        if (accountRepository.count() == 0) {
            // Tạo tài khoản admin
            Account admin = new Account();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@example.com");
            admin.setRole(Role.ADMIN);
            admin.setStatus(AccountStatus.ACTIVE);
            admin.setCreatedAt(LocalDateTime.now());
            accountRepository.save(admin);

            // Tạo Member cho Admin
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

            // Tạo 10 tài khoản người dùng đã xác thực
            IntStream.range(1, 11).forEach(i -> {
                Account user = new Account();
                user.setUsername("user" + i);
                user.setPassword(passwordEncoder.encode("password" + i));
                user.setEmail("user" + i + "@example.com");
                user.setRole(Role.MEMBER);
                user.setStatus(AccountStatus.ACTIVE);
                user.setCreatedAt(LocalDateTime.now());
                accountRepository.save(user);

                // Tạo Member cho từng User
                Member member = new Member();
                member.setFullName("User " + i);
                member.setFirstName("User");
                member.setLastName("" + i);
                member.setPhone("098765432" + i);
                member.setAddress("123 User Street " + i);
                member.setCity("User City");
                member.setDistrict("User District");
                member.setWard("User Ward");
                member.setDateOfBirth(LocalDate.of(2000, i, i));
                member.setCreatedAt(LocalDateTime.now());
                member.setUpdatedAt(LocalDateTime.now());
                member.setAccount(user);
                memberRepository.save(member);
            });
        }

        if (challengeTypeRepository.count() == 0) {
            // Tạo hai ChallengeType mới
            ChallengeType fitnessType = ChallengeType.builder()
                    .name("Fitness")
                    .description("Challenge liên quan đến hoạt động thể dục, thể thao.")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            ChallengeType learningType = ChallengeType.builder()
                    .name("Learning")
                    .description("Challenge liên quan đến học tập và phát triển kỹ năng.")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            challengeTypeRepository.save(fitnessType);
            challengeTypeRepository.save(learningType);
        }

        // Thêm Interests nếu chưa có
        if (interestRepository.count() == 0) {
            List<String> interestNames = List.of("Sports", "Music", "Coding", "Reading", "Gaming", "Traveling", "Cooking");
            List<Interest> interests = interestNames.stream()
                    .map(name -> {
                        Interest interest = new Interest();
                        interest.setName(name);
                        return interest;
                    }).collect(Collectors.toList());

            interestRepository.saveAll(interests);
        }
        if (challengeMemberRepository.count() == 0) {
            List<Member> members = memberRepository.findAll();
            List<Challenge> challenges = challengeRepository.findAll();

            if (!members.isEmpty() && !challenges.isEmpty()) {
                Member host = members.get(0);
                Member coHost = members.size() > 1 ? members.get(1) : null;
                Member member = members.size() > 2 ? members.get(2) : null;

                for (int i = 0; i < challenges.size(); i++) {
                    Challenge challenge = challenges.get(i);

                    ChallengeMember hostMember = ChallengeMember.builder()
                            .challenge(challenge)
                            .member(host)
                            .status(ChallengeMemberStatus.JOINED)
                            .role(ChallengeRole.HOST)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    challengeMemberRepository.save(hostMember);

                    if (coHost != null) {
                        ChallengeMember coHostMember = ChallengeMember.builder()
                                .challenge(challenge)
                                .member(coHost)
                                .status(ChallengeMemberStatus.JOINED)
                                .role(ChallengeRole.CO_HOST)
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();
                        challengeMemberRepository.save(coHostMember);
                    }

                    if (member != null) {
                        ChallengeMember normalMember = ChallengeMember.builder()
                                .challenge(challenge)
                                .member(member)
                                .status(ChallengeMemberStatus.JOINED)
                                .role(ChallengeRole.MEMBER)
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();
                        challengeMemberRepository.save(normalMember);
                    }
                }
            }
        }


        return true;
        }
    }

