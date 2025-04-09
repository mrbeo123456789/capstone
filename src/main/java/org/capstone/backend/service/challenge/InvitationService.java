package org.capstone.backend.service.challenge;

import org.capstone.backend.dto.challenge.ChallengeSearchRequest;
import org.capstone.backend.dto.challenge.InvitationResponseDTO;
import org.capstone.backend.dto.challenge.InviteGroupToChallengeRequest;
import org.capstone.backend.dto.challenge.InviteMemberRequest;
import org.capstone.backend.dto.group.MemberSearchResponse;
import org.capstone.backend.entity.Challenge;
import org.capstone.backend.entity.ChallengeMember;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.entity.Member;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.repository.ChallengeMemberRepository;
import org.capstone.backend.repository.ChallengeRepository;
import org.capstone.backend.repository.GroupMemberRepository;
import org.capstone.backend.repository.GroupRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.*;
import org.capstone.backend.utils.suggestion.MemberSuggestionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InvitationService implements InvitationServiceInterface {

    private final ChallengeRepository challengeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final MemberRepository memberRepository;
    private final AccountRepository accountRepository;
    private final AuthService authService;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final MemberSuggestionService memberSuggestionService;

    public InvitationService(ChallengeRepository challengeRepository,
                             ChallengeMemberRepository challengeMemberRepository,
                             MemberRepository memberRepository,
                             AccountRepository accountRepository,
                             AuthService authService,
                             GroupRepository groupRepository,
                             GroupMemberRepository groupMemberRepository,
                             MemberSuggestionService memberSuggestionService) {
        this.challengeRepository = challengeRepository;
        this.challengeMemberRepository = challengeMemberRepository;
        this.memberRepository = memberRepository;
        this.accountRepository = accountRepository;
        this.authService = authService;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.memberSuggestionService = memberSuggestionService;
    }

    private Member getAuthenticatedMember() {
        return memberRepository.findById(authService.getMemberIdFromAuthentication())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found."));
    }
    @Override
    public String sendInvitation(InviteMemberRequest request) {
        Member invitedBy = getAuthenticatedMember();
        Challenge challenge = challengeRepository.findById(request.getChallengeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found"));

        // Xác định trạng thái lời mời dựa trên trạng thái của thử thách
        ChallengeMemberStatus status = (challenge.getStatus() != ChallengeStatus.UPCOMING)
                ? ChallengeMemberStatus.EXPIRED : ChallengeMemberStatus.WAITING;

        // Batch fetch các thành viên theo danh sách memberIds
        List<Member> members = memberRepository.findAllById(request.getMemberIds());
        LocalDateTime now = LocalDateTime.now();
        List<ChallengeMember> invitations = new ArrayList<>();

        for (Member member : members) {
            // Kiểm tra nếu member đã tham gia thử thách (với status JOINED) thì bỏ qua
            Optional<ChallengeMember> existingMember = challengeMemberRepository.findByMemberAndChallenge(member, challenge);
            if (existingMember.isPresent() && existingMember.get().getStatus() == ChallengeMemberStatus.JOINED) {
                continue;
            }
            // Tạo lời mời cho thành viên mà KHÔNG cần kiểm tra invitePermission
            ChallengeMember challengeMember = ChallengeMember.builder()
                    .challenge(challenge)
                    .member(member)
                    .role(ChallengeRole.MEMBER)
                    .joinBy(invitedBy.getId())
                    .status(status)
                    .createdAt(now)
                    .build();
            invitations.add(challengeMember);
        }
        challengeMemberRepository.saveAll(invitations);

        return (status == ChallengeMemberStatus.EXPIRED)
                ? "Challenge is not upcoming. All invitations are expired."
                : "Invitations sent successfully to " + invitations.size() + " member(s).";
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
            if (challenge.getMaxParticipants() != null &&
                    challengeMemberRepository.countByChallengeAndStatus(challenge, ChallengeMemberStatus.JOINED) >= challenge.getMaxParticipants()) {
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

        return groupedByChallenge.entrySet().stream()
                .map(entry -> {
                    Challenge challenge = entry.getKey();
                    List<ChallengeMember> challengeMembers = entry.getValue();

                    // Nếu có trạng thái nào không phải WAITING thì không hiển thị
                    if (challengeMembers.stream().anyMatch(cm -> cm.getStatus() != ChallengeMemberStatus.WAITING)) {
                        return null;
                    }

                    List<String> inviterNames = challengeMembers.stream()
                            .map(cm -> memberRepository.findById(cm.getJoinBy())
                                    .map(Member::getFirstName)
                                    .orElse("Unknown"))
                            .toList();

                    String inviterDisplay = (inviterNames.size() == 1) ? inviterNames.get(0) : "Multiple users";
                    Long invitationId = challengeMembers.get(0).getId();

                    return new InvitationResponseDTO(challenge.getId(), invitationId, challenge.getName(),  inviterDisplay,challenge.getPicture());
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    public List<MemberSearchResponse> searchMembersForChallengeInvite(ChallengeSearchRequest request) {
        Pageable pageable = PageRequest.of(0, 20);
        Long currentMemberId = authService.getMemberIdFromAuthentication();

        // Lấy danh sách member theo keyword (đã có phân trang)
        Page<Member> memberPage = memberRepository.searchMembersByKeyword(request.getKeyword(), pageable);
        List<Member> members = memberPage.getContent();

        // Danh sách memberId (loại current member)
        List<Long> memberIds = members.stream()
                .map(Member::getId)
                .filter(id -> !id.equals(currentMemberId))
                .collect(Collectors.toList());

        // Danh sách các member đã tham gia thử thách
        List<Long> joinedMemberIds = challengeMemberRepository.findMemberIdsByChallengeId(request.getChallengeid());

        // Batch query: danh sách member cùng nhóm với currentMemberId
        List<Long> commonGroupMemberIds = groupMemberRepository.findCommonGroupMemberIds(currentMemberId, memberIds);

        return members.stream()
                .filter(m -> !m.getId().equals(currentMemberId)) // Loại bỏ current member
                .filter(m -> m.getInvitePermission() != InvitePermission.NO_ONE) // Chỉ mời những member có quyền mời
                .filter(m -> !joinedMemberIds.contains(m.getId())) // Loại bỏ những người đã tham gia thử thách
                .filter(m -> {
                    // Nếu InvitePermission là SAME_GROUP thì chỉ mời nếu cùng nhóm
                    if (m.getInvitePermission() == InvitePermission.SAME_GROUP) {
                        return commonGroupMemberIds.contains(m.getId());
                    }
                    return true;
                })
                .limit(5)
                .map(m -> new MemberSearchResponse(
                        m.getId(),
                        m.getAccount().getEmail(),
                        m.getAvatar(),
                        m.getFullName(),
                        "" // lý do có thể để trống
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<MemberSearchResponse> suggestMembers(Long challengeId) {
        Long currentMemberId = authService.getMemberIdFromAuthentication();
        return memberSuggestionService.suggestMembers(currentMemberId, challengeId);
    }

    @Override
    public String sendGroupInvitationToChallenge(InviteGroupToChallengeRequest request) {
        Member invitedBy = getAuthenticatedMember();
        Challenge challenge = challengeRepository.findById(request.getChallengeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found"));
        Groups group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        ChallengeMemberStatus status = (challenge.getStatus() != ChallengeStatus.UPCOMING)
                ? ChallengeMemberStatus.EXPIRED : ChallengeMemberStatus.WAITING;

        // Lấy danh sách thành viên của nhóm với trạng thái ACTIVE
        List<Member> groupMembers = groupMemberRepository.findMembersByGroupIdAndStatus(group.getId(), GroupMemberStatus.ACTIVE);
        LocalDateTime now = LocalDateTime.now();

        // Bỏ qua người gửi (invitedBy)
        groupMembers.removeIf(member -> member.getId().equals(invitedBy.getId()));

        // Tạo lời mời cho các thành viên trong nhóm (có kiểm tra invitePermission)
        List<ChallengeMember> invitations = createInvitationsForChallenge(challenge, groupMembers, invitedBy.getId(), status, now);
        challengeMemberRepository.saveAll(invitations);

        return (status == ChallengeMemberStatus.EXPIRED)
                ? "Challenge is not upcoming. All invitations are expired."
                : "Invitations sent successfully to " + invitations.size() + " member(s) from the group.";
    }

    private List<ChallengeMember> createInvitationsForChallenge(
            Challenge challenge,
            List<Member> members,
            Long invitedById,
            ChallengeMemberStatus status,
            LocalDateTime now) {

        List<ChallengeMember> invitations = new ArrayList<>();

        for (Member member : members) {
            // Kiểm tra nếu member đã tham gia thử thách (với status JOINED) thì bỏ qua
            Optional<ChallengeMember> existingMember = challengeMemberRepository.findByMemberAndChallenge(member, challenge);
            if (existingMember.isPresent() && existingMember.get().getStatus() == ChallengeMemberStatus.JOINED) {
                continue;
            }

            // Kiểm tra invitePermission của member (target)
            // Với SAME_GROUP: chỉ mời nếu có ít nhất 1 nhóm chung giữa người mời và member
            // Với NO_ONE: bỏ qua; với EVERYONE: luôn cho mời
            if (member.getInvitePermission() == InvitePermission.NO_ONE) {
                continue;
            } else if (member.getInvitePermission() == InvitePermission.SAME_GROUP) {
                boolean sameGroup = groupMemberRepository.checkIfInSameGroup(invitedById, member.getId());
                if (!sameGroup) {
                    continue;
                }
            }

            // Tạo lời mời cho member nếu thỏa điều kiện
            ChallengeMember challengeMember = ChallengeMember.builder()
                    .challenge(challenge)
                    .member(member)
                    .joinBy(invitedById)
                    .status(status)
                    .createdAt(now)
                    .build();
            invitations.add(challengeMember);
        }

        return invitations;
    }



}
