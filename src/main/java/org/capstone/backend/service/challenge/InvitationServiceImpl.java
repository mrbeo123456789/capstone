package org.capstone.backend.service.challenge;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.dto.group.MemberSearchResponse;
import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.*;
import org.capstone.backend.utils.suggestion.MemberSuggestionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class InvitationServiceImpl implements InvitationService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final MemberRepository memberRepository;
    private final AuthService authService;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final MemberSuggestionService memberSuggestionService;
    private final GroupChallengeRepository groupChallengeRepository;

    /**
     * Lấy thông tin thành viên đã xác thực hiện tại.
     *
     * @return Member thành viên đang xác thực
     * @throws ResponseStatusException nếu không tìm thấy thành viên
     */
    private Member getAuthenticatedMember() {
        return memberRepository.findById(authService.getMemberIdFromAuthentication())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found."));
    }

    /**
     * Gửi lời mời tham gia thử thách cho danh sách thành viên.
     * Sử dụng Stream để lọc bỏ những member đã tham gia thử thách với status JOINED.
     *
     * @param request Chứa thông tin ID thử thách và danh sách ID thành viên được mời
     * @return Thông báo kết quả gửi lời mời, bao gồm số lượng lời mời gửi thành công hoặc thông báo hết hạn nếu challenge không ở trạng thái UPCOMING
     * @throws ResponseStatusException nếu không tìm thấy thử thách
     */
    @Override
    public String sendInvitation(InviteMemberRequest request) {
        Member invitedBy = getAuthenticatedMember();
        Challenge challenge = challengeRepository.findById(request.getChallengeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found"));

        // Xác định trạng thái lời mời dựa trên trạng thái của thử thách (nếu không UPCOMING thì mark là EXPIRED)
        ChallengeMemberStatus status = (challenge.getStatus() != ChallengeStatus.UPCOMING)
                ? ChallengeMemberStatus.EXPIRED : ChallengeMemberStatus.WAITING;
        LocalDateTime now = LocalDateTime.now();

        // Lấy danh sách các member từ DB, loại bỏ những member đã JOINED rồi,
        // và tạo đối tượng ChallengeMember thông qua stream.
        List<ChallengeMember> invitations = memberRepository.findAllById(request.getMemberIds())
                .stream()
                .filter(member -> {
                    Optional<ChallengeMember> existing = challengeMemberRepository.findByMemberAndChallenge(member, challenge);
                    // Nếu chưa có dữ liệu hoặc nếu đã có nhưng chưa JOINED thì cho phép tạo lời mời
                    return existing.map(cm -> cm.getStatus() != ChallengeMemberStatus.JOINED).orElse(true);
                })
                .map(member -> ChallengeMember.builder()
                        .challenge(challenge)
                        .member(member)
                        .role(ChallengeRole.MEMBER)
                        .joinBy(invitedBy.getId())
                        .status(status)
                        .createdAt(now)
                        .build())
                .collect(Collectors.toList());

        challengeMemberRepository.saveAll(invitations);

        return (status == ChallengeMemberStatus.EXPIRED)
                ? "Challenge is not upcoming. All invitations are expired."
                : "Invitations sent successfully to " + invitations.size() + " member(s).";
    }

    /**
     * Xử lý phản hồi lời mời tham gia thử thách.
     * Nếu loại lời mời là PERSONAL thì xử lý theo ChallengeMember,
     * còn nếu là GROUP thì kiểm tra quyền Leader (OWNER) của nhóm và cập nhật trạng thái GroupChallenge,
     * sau đó thêm toàn bộ thành viên trong group vào ChallengeMember thông qua batch insert (sử dụng Stream).
     *
     * @param request Dữ liệu phản hồi lời mời (loại lời mời, ID lời mời và hành động accept/reject)
     * @return Thông báo kết quả phản hồi lời mời
     * @throws ResponseStatusException nếu lời mời không tồn tại hoặc thành viên không có quyền phản hồi
     */
    @Override
    @Transactional
    public String respondToInvitation(InvitationRespondRequestDTO request) {
        Member member = getAuthenticatedMember();
        String invitationType = request.getInvitationType();
        boolean accept = request.getAccept();

        if ("PERSONAL".equalsIgnoreCase(invitationType)) {
            // Xử lý lời mời cá nhân
            ChallengeMember challengeMember = challengeMemberRepository.findById(request.getInvitationId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found."));

            if (!challengeMember.getMember().equals(member)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to respond to this invitation.");
            }

            Challenge challenge = challengeMember.getChallenge();
            // Nếu accept nhưng challenge không ở trạng thái UPCOMING hoặc đã đạt giới hạn số người tham gia thì từ chối (mark EXPIRED)
            if (accept) {
                if (challenge.getStatus() != ChallengeStatus.UPCOMING ||
                        (challenge.getMaxParticipants() != null &&
                                challengeMemberRepository.countByChallengeAndStatus(challenge, ChallengeMemberStatus.JOINED)
                                        >= challenge.getMaxParticipants())) {
                    challengeMember.setStatus(ChallengeMemberStatus.EXPIRED);
                    challengeMember.setUpdatedAt(LocalDateTime.now());
                    challengeMemberRepository.save(challengeMember);
                    return "Cannot join the challenge. Invitation expired or challenge is full.";
                }
                challengeMember.setStatus(ChallengeMemberStatus.JOINED);
            } else {
                challengeMember.setStatus(ChallengeMemberStatus.REJECTED);
            }
            challengeMember.setUpdatedAt(LocalDateTime.now());
            challengeMemberRepository.save(challengeMember);

        } else if ("GROUP".equalsIgnoreCase(invitationType)) {
            // Xử lý lời mời nhóm
            GroupChallenge groupChallenge = groupChallengeRepository.findById(request.getInvitationId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group invitation not found."));

            Groups group = groupChallenge.getGroup();
            Challenge challenge = groupChallenge.getChallenge();

            if (accept) {
                if (challenge.getStatus() != ChallengeStatus.UPCOMING) {
                    groupChallenge.setStatus(GroupChallengeStatus.REJECTED);
                    groupChallenge.setUpdatedAt(LocalDateTime.now());
                    groupChallengeRepository.save(groupChallenge);
                    return "Cannot join. The challenge is not available.";
                }
                groupChallenge.setStatus(GroupChallengeStatus.ONGOING);
                groupChallenge.setUpdatedAt(LocalDateTime.now());
                groupChallengeRepository.save(groupChallenge);

                // Batch thêm toàn bộ thành viên trong group vào challenge
                List<ChallengeMember> newChallengeMembers = group.getMembers()
                        .stream()
                        .map(GroupMember::getMember)
                        // Loại bỏ những member đã từng tham gia challenge
                        .filter(groupMember -> !challengeMemberRepository.existsByChallengeAndMember(challenge, groupMember))
                        .map(groupMember -> ChallengeMember.builder()
                                .challenge(challenge)
                                .member(groupMember)
                                .role(ChallengeRole.MEMBER)
                                .status(ChallengeMemberStatus.JOINED)
                                .groupId(group.getId())
                                .joinBy(member.getId()) // Leader gửi lời mời
                                .createdAt(LocalDateTime.now())
                                .build())
                        .collect(Collectors.toList());
                if (!newChallengeMembers.isEmpty()) {
                    challengeMemberRepository.saveAll(newChallengeMembers);
                }
            } else {
                groupChallenge.setStatus(GroupChallengeStatus.REJECTED);
                groupChallenge.setUpdatedAt(LocalDateTime.now());
                groupChallengeRepository.save(groupChallenge);
            }
        }
        return accept ? "Invitation accepted successfully." : "Invitation rejected successfully.";
    }

    /**
     * Lấy danh sách tất cả lời mời tham gia thử thách của thành viên hiện tại.
     * Gộp lời mời cá nhân (ChallengeMember với status WAITING) và lời mời nhóm (GroupChallenge với status PENDING, khi member là Leader).
     *
     * @return Danh sách InvitationResponseDTO chứa thông tin lời mời
     */
    @Override
    public List<InvitationResponseDTO> getInvitationsForMember() {
        Member member = getAuthenticatedMember();

        // Lấy lời mời cá nhân, nhóm theo challenge và chỉ lấy khi tất cả đều có status WAITING
        List<InvitationResponseDTO> personalInvitations = challengeMemberRepository.findByMemberAndStatus(member, ChallengeMemberStatus.WAITING)
                .stream()
                .collect(Collectors.groupingBy(ChallengeMember::getChallenge))
                .entrySet().stream()
                .filter(entry -> entry.getValue().stream()
                        .allMatch(cm -> cm.getStatus() == ChallengeMemberStatus.WAITING))
                .map(entry -> {
                    Challenge challenge = entry.getKey();
                    List<ChallengeMember> invitations = entry.getValue();
                    // Lấy tên người mời; nếu có nhiều người mời hiển thị "Multiple users"
                    List<String> inviterNames = invitations.stream()
                            .map(cm -> memberRepository.findById(cm.getJoinBy())
                                    .map(Member::getFirstName)
                                    .orElse("Unknown"))
                            .toList();
                    String inviterDisplay = (inviterNames.size() == 1) ? inviterNames.get(0) : "Multiple users";
                    return new InvitationResponseDTO(
                            challenge.getId(),
                            invitations.get(0).getId(),
                            challenge.getName(),
                            inviterDisplay,
                            challenge.getPicture(),
                            "PERSONAL"
                    );
                })
                .toList();

        // Lấy lời mời nhóm đối với các nhóm có member với vai trò OWNER và status ACTIVE
        List<InvitationResponseDTO> groupInvitations = groupMemberRepository.findByMemberAndRoleAndStatus(member, "OWNER", GroupMemberStatus.ACTIVE)
                .stream()
                .flatMap(gm -> groupChallengeRepository.findByGroupAndStatus(gm.getGroup(), GroupChallengeStatus.PENDING).stream())
                .map(gc -> new InvitationResponseDTO(
                        gc.getChallenge().getId(),
                        gc.getId(),
                        gc.getChallenge().getName(),
                        "Group Invitation: " + gc.getGroup().getName(),
                        gc.getChallenge().getPicture(),
                        "GROUP"
                ))
                .toList();

        // Gộp kết quả lời mời cá nhân và nhóm
        return Stream.concat(personalInvitations.stream(), groupInvitations.stream())
                .collect(Collectors.toList());
    }

    /**
     * Tìm kiếm danh sách thành viên có khả năng nhận lời mời tham gia thử thách theo từ khóa.
     * Loại bỏ thành viên hiện tại, những người đã tham gia hoặc không cho phép mời.
     * Nếu invitePermission = SAME_GROUP thì chỉ chấp nhận khi có ít nhất 1 nhóm chung.
     *
     * @param request Chứa từ khóa tìm kiếm và ID thử thách
     * @return Danh sách MemberSearchResponse tối đa 5 người
     */
    @Override
    public List<MemberSearchResponse> searchMembersForChallengeInvite(ChallengeSearchRequest request) {
        Pageable pageable = PageRequest.of(0, 20);
        Long currentMemberId = authService.getMemberIdFromAuthentication();
        Page<Member> memberPage = memberRepository.searchMembersByKeyword(request.getKeyword(), pageable);
        List<Member> members = memberPage.getContent();

        // Lấy danh sách các member đã tham gia thử thách và danh sách member có nhóm chung với currentMemberId
        List<Long> joinedMemberIds = challengeMemberRepository.findMemberIdsByChallengeId(request.getChallengeid());
        List<Long> commonGroupMemberIds = groupMemberRepository.findCommonGroupMemberIds(
                currentMemberId,
                members.stream().map(Member::getId)
                        .filter(id -> !id.equals(currentMemberId))
                        .collect(Collectors.toList())
        );

        return members.stream()
                .filter(m -> !m.getId().equals(currentMemberId))
                .filter(m -> m.getInvitePermission() != InvitePermission.NO_ONE)
                .filter(m -> !joinedMemberIds.contains(m.getId()))
                .filter(m -> m.getInvitePermission() != InvitePermission.SAME_GROUP || commonGroupMemberIds.contains(m.getId()))
                .limit(5)
                .map(m -> new MemberSearchResponse(
                        m.getId(),
                        m.getAccount().getEmail(),
                        m.getAvatar(),
                        m.getFullName(),
                        ""
                ))
                .collect(Collectors.toList());
    }

    /**
     * Gợi ý danh sách thành viên dựa trên thuật toán gợi ý.
     *
     * @param challengeId ID của thử thách
     * @return Danh sách các MemberSearchResponse được gợi ý
     */
    @Override
    public List<MemberSearchResponse> suggestMembers(Long challengeId) {
        Long currentMemberId = authService.getMemberIdFromAuthentication();
        return memberSuggestionService.suggestMembers(currentMemberId, challengeId);
    }

    /**
     * Gửi lời mời tham gia thử thách cho toàn bộ thành viên trong một nhóm.
     * Lấy danh sách thành viên ACTIVE (trừ người gửi), sau đó tạo lời mời dựa theo quyền mời của từng member.
     *
     * @param request Chứa thông tin ID thử thách và ID nhóm
     * @return Thông báo kết quả gửi lời mời
     * @throws ResponseStatusException nếu không tìm thấy thử thách hoặc group
     */
    @Override
    public String sendGroupInvitationToChallenge(InviteGroupToChallengeRequest request) {
        Member invitedBy = getAuthenticatedMember();
        Challenge challenge = challengeRepository.findById(request.getChallengeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found"));
        Groups group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        // Xác định trạng thái lời mời theo trạng thái của challenge
        ChallengeMemberStatus status = (challenge.getStatus() != ChallengeStatus.UPCOMING)
                ? ChallengeMemberStatus.EXPIRED : ChallengeMemberStatus.WAITING;
        LocalDateTime now = LocalDateTime.now();

        // Lấy danh sách thành viên ACTIVE trong group (trừ người gửi) và sử dụng Stream để thu thập
        List<Member> groupMembers = groupMemberRepository.findMembersByGroupIdAndStatus(group.getId(), GroupMemberStatus.ACTIVE)
                .stream()
                .filter(member -> !member.getId().equals(invitedBy.getId()))
                .collect(Collectors.toList());

        List<ChallengeMember> invitations = createInvitationsForChallenge(challenge, groupMembers, invitedBy.getId(), status, now);
        challengeMemberRepository.saveAll(invitations);

        return (status == ChallengeMemberStatus.EXPIRED)
                ? "Challenge is not upcoming. All invitations are expired."
                : "Invitations sent successfully to " + invitations.size() + " member(s) from the group.";
    }

    /**
     * Tạo danh sách lời mời tham gia thử thách cho danh sách member.
     * Lọc bỏ member đã tham gia và dựa vào invitePermission (với SAME_GROUP cần có nhóm chung).
     *
     * @param challenge   Thử thách cần mời
     * @param members     Danh sách member mục tiêu
     * @param invitedById ID của người gửi lời mời
     * @param status      Trạng thái lời mời (WAITING hoặc EXPIRED)
     * @param now         Thời điểm tạo lời mời
     * @return Danh sách ChallengeMember tương ứng với lời mời được tạo
     */
    private List<ChallengeMember> createInvitationsForChallenge(Challenge challenge,
                                                                List<Member> members,
                                                                Long invitedById,
                                                                ChallengeMemberStatus status,
                                                                LocalDateTime now) {
        return members.stream()
                .filter(member -> {
                    Optional<ChallengeMember> existing = challengeMemberRepository.findByMemberAndChallenge(member, challenge);
                    // Nếu đã tham gia thì loại bỏ
                    if (existing.isPresent() && existing.get().getStatus() == ChallengeMemberStatus.JOINED) return false;
                    // Kiểm tra quyền mời: nếu NO_ONE thì bỏ qua;
                    // nếu SAME_GROUP thì chỉ cho phép nếu có nhóm chung
                    if (member.getInvitePermission() == InvitePermission.NO_ONE) return false;
                    return member.getInvitePermission() != InvitePermission.SAME_GROUP ||
                            groupMemberRepository.checkIfInSameGroup(invitedById, member.getId());
                })
                .map(member -> ChallengeMember.builder()
                        .challenge(challenge)
                        .member(member)
                        .joinBy(invitedById)
                        .status(status)
                        .createdAt(now)
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Tìm kiếm danh sách các chủ nhóm (group leaders) có thể mời thành viên vào thử thách dựa trên từ khóa.
     * Giới hạn tối đa 5 kết quả.
     *
     * @param challengeId ID của thử thách
     * @param keyword     Từ khóa tìm kiếm
     * @return Danh sách MemberSearchResponse của các chủ nhóm phù hợp
     */
    @Override
    public List<MemberSearchResponse> searchAvailableGroupLeaders(Long challengeId, String keyword) {
        Long currentMemberId = authService.getMemberIdFromAuthentication();
        Pageable pageable = PageRequest.of(0, 5);
        return groupMemberRepository.searchAvailableGroupLeaders(
                challengeId,
                keyword,
                GroupMemberStatus.ACTIVE,
                GroupChallengeStatus.PENDING,
                GroupChallengeStatus.ONGOING,
                InvitePermission.EVERYONE,
                currentMemberId,
                pageable
        );
    }
}
