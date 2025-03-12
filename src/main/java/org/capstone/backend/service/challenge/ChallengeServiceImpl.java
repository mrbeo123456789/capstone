package org.capstone.backend.service.challenge;

import org.capstone.backend.dto.challenge.ChallengeRequest;
import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.utils.enums.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ChallengeServiceImpl implements ChallengeService {


    private ChallengeRepository challengeRepository;


    private AccountRepository accountRepository;

    private MemberRepository memberRepository;

    private ChallengeTypeRepository challengeTypeRepository;

    public ChallengeServiceImpl(ChallengeRepository challengeRepository, AccountRepository accountRepository, MemberRepository memberRepository, ChallengeTypeRepository challengeTypeRepository) {
        this.challengeRepository = challengeRepository;
        this.accountRepository = accountRepository;
        this.memberRepository = memberRepository;
        this.challengeTypeRepository = challengeTypeRepository;
    }
    @Override
    public Challenge createChallenge(ChallengeRequest request, String username) {
        // 🔥 Lấy thông tin tài khoản
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        // 🔥 Lấy thông tin member của tài khoản
        Member member = memberRepository.findByAccount(account)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        // 🔥 Lấy thông tin ChallengeType theo id từ request
        ChallengeType challengeType = challengeTypeRepository.findById(request.getChallengeTypeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ChallengeType not found"));

        // 🔥 Tạo mới challenge
        Challenge challenge = Challenge.builder()
                .name(request.getName())
                .description(request.getDescription())
                .rule(request.getRule())
                .privacy(request.getPrivacy())
                .status(ChallengeStatus.PENDING)
                .verificationType(request.getVerificationType())
                .verificationMethod(request.getVerificationMethod())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .maxParticipants(request.getMaxParticipants())
                .createdBy(member.getId())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .updatedBy(member.getId()) // Gán người cập nhật ban đầu bằng member tạo challenge
                .challengeType(challengeType) // Chỉ lưu một ChallengeType
                .build();

        return challengeRepository.save(challenge);
    }

    public List<ChallengeType> getAllTypes() {
        return challengeTypeRepository.findAll();
    }


    public Challenge reviewChallenge(Long challengeId, ChallengeStatus status, String adminNote) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Challenge với id: " + challengeId));
        challenge.setStatus(status);
        challenge.setAdminNote(adminNote);
        return challengeRepository.save(challenge);
    }
}
