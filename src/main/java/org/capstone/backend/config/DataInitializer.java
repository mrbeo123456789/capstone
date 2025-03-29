package org.capstone.backend.config;

import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.utils.enums.AccountStatus;
import org.capstone.backend.utils.enums.ChallengeStatus;
import org.capstone.backend.utils.enums.PrivacyStatus;
import org.capstone.backend.utils.enums.Role;
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

    public DataInitializer(AccountRepository accountRepository,
                           ChallengeTypeRepository challengeTypeRepository,
                           MemberRepository memberRepository,
                           InterestRepository interestRepository,
                           PasswordEncoder passwordEncoder, ChallengeRepository challengeRepository) {
        this.accountRepository = accountRepository;
        this.challengeTypeRepository = challengeTypeRepository;
        this.memberRepository = memberRepository;
        this.interestRepository = interestRepository;
        this.passwordEncoder = passwordEncoder;
        this.challengeRepository = challengeRepository;
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
        if (challengeRepository.count() == 0) {
            List<ChallengeType> types = challengeTypeRepository.findAll();
            ChallengeType fitnessType = types.stream().filter(t -> t.getName().equals("Fitness")).findFirst().orElse(null);
            ChallengeType learningType = types.stream().filter(t -> t.getName().equals("Learning")).findFirst().orElse(null);

            Member adminMember = memberRepository.findByEmail("user1@example.com").orElse(null);

            if (fitnessType != null && learningType != null && adminMember != null) {
                for (int i = 1; i <= 10; i++) {
                    Challenge challenge = Challenge.builder()
                            .name("Thử thách " + i)
                            .description("Mô tả thử thách số " + i)
                            .startDate(LocalDate.now().plusDays(i))
                            .endDate(LocalDate.now().plusDays(i + 30))
                            .maxParticipants(100)
                            .status(ChallengeStatus.PENDING)
                            .challengeType(i % 2 == 0 ? fitnessType : learningType)
                            .createdBy(adminMember.getId())
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .privacy(PrivacyStatus.PUBLIC)
                            .build();

                    challengeRepository.save(challenge);
                }
            }
        }

            return true;
        }
    }

