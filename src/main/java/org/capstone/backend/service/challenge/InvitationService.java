package org.capstone.backend.service.challenge;

import org.capstone.backend.dto.challenge.InvitationResponseDTO;
import org.capstone.backend.dto.challenge.InviteMemberRequest;
import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.utils.enums.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InvitationService implements InvitationServiceInterface {

    private final ChallengeRepository challengeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final MemberRepository memberRepository;
    private final AccountRepository accountRepository;

    public InvitationService(ChallengeRepository challengeRepository, ChallengeMemberRepository challengeMemberRepository, MemberRepository memberRepository, AccountRepository accountRepository) {
        this.challengeRepository = challengeRepository;
        this.challengeMemberRepository = challengeMemberRepository;
        this.memberRepository = memberRepository;
        this.accountRepository = accountRepository;
    }

    private Member getAuthenticatedMember() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("User is not authenticated");
        }

        String username = authentication.getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found."));

        return memberRepository.findByAccount(account)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found."));
    }

    @Override
    public String sendInvitation(InviteMemberRequest request) {
        Member invitedBy = getAuthenticatedMember();
        Challenge challenge = challengeRepository.findById(request.getChallengeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found"));

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        Optional<ChallengeMember> existingMember = challengeMemberRepository.findByMemberAndChallenge(member, challenge);
        if (existingMember.isPresent() && existingMember.get().getStatus() == ChallengeMemberStatus.JOINED) {
            return "Member has already joined this challenge.";
        }

        ChallengeMemberStatus status = (challenge.getStatus() != ChallengeStatus.UPCOMING) ?
                ChallengeMemberStatus.EXPIRED : ChallengeMemberStatus.WAITING;

        ChallengeMember challengeMember = ChallengeMember.builder()
                .challenge(challenge)
                .member(member)
                .joinBy(invitedBy.getId())
                .status(status)
                .createdAt(LocalDateTime.now())
                .updatedAt(null)
                .build();

        challengeMemberRepository.save(challengeMember);

        return (status == ChallengeMemberStatus.EXPIRED) ? "Challenge is not upcoming. Invitation is expired." : "Invitation sent successfully.";
    }

    @Override
    public String respondToInvitation(Long invitationId, boolean accept) {
        Member member = getAuthenticatedMember();
        ChallengeMember challengeMember = challengeMemberRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found."));

        if (!challengeMember.getMember().equals(member)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to respond to this invitation.");
        }

        Challenge challenge = challengeMember.getChallenge();

        if (accept) {
            if (challenge.getStatus() != ChallengeStatus.UPCOMING) {
                challengeMember.setStatus(ChallengeMemberStatus.EXPIRED);
                challengeMember.setUpdatedAt(LocalDateTime.now());
                challengeMemberRepository.save(challengeMember);
                return "Cannot join the challenge. The challenge is not upcoming, invitation is expired.";
            }

            if (challenge.getMaxParticipants() != null && challengeMemberRepository.countByChallengeAndStatus(challenge, ChallengeMemberStatus.JOINED) >= challenge.getMaxParticipants()) {
                challengeMember.setStatus(ChallengeMemberStatus.EXPIRED);
                challengeMember.setUpdatedAt(LocalDateTime.now());
                challengeMemberRepository.save(challengeMember);
                return "Cannot join the challenge. The challenge has reached its maximum number of participants.";
            }

            challengeMember.setStatus(ChallengeMemberStatus.JOINED);
        } else {
            challengeMember.setStatus(ChallengeMemberStatus.REJECTED);
        }

        challengeMember.setUpdatedAt(LocalDateTime.now());
        challengeMemberRepository.save(challengeMember);

        return accept ? "Invitation accepted successfully." : "Invitation rejected successfully.";
    }

    @Override
    public List<InvitationResponseDTO> getInvitationsForMember() {
        Member member = getAuthenticatedMember();
        List<ChallengeMember> waitingInvitations = challengeMemberRepository.findByMemberAndStatus(member, ChallengeMemberStatus.WAITING);

        Map<Challenge, List<ChallengeMember>> groupedByChallenge = waitingInvitations.stream()
                .collect(Collectors.groupingBy(ChallengeMember::getChallenge));

        return groupedByChallenge.entrySet().stream().map(entry -> {
            Challenge challenge = entry.getKey();
            List<ChallengeMember> challengeMembers = entry.getValue();

            if (challengeMembers.stream().anyMatch(cm -> cm.getStatus() != ChallengeMemberStatus.WAITING)) {
                return null;
            }

            List<String> inviterNames = challengeMembers.stream()
                    .map(cm -> memberRepository.findById(cm.getJoinBy()).map(Member::getFirstName).orElse("Unknown"))
                    .toList();

            String inviterDisplay = inviterNames.size() == 1 ? inviterNames.get(0) : "Multiple invitations";

            Long invitationId = challengeMembers.get(0).getId();

            return new InvitationResponseDTO( challenge.getId(),invitationId, challenge.getName(), challenge.getPicture(), inviterDisplay);
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }
}
