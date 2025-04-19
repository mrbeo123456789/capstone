package org.capstone.backend.service.challenge;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.dto.group.MemberSearchResponse;
import org.capstone.backend.entity.*;
import org.capstone.backend.event.InvitationSentEvent;
import org.capstone.backend.repository.*;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.*;
import org.capstone.backend.utils.suggestion.MemberSuggestionService;
import org.springframework.context.ApplicationEventPublisher;
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
@RequiredArgsConstructor
@Service
public class InvitationServiceImpl implements InvitationService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeMemberRepository challengeMemberRepository;
    private final MemberRepository memberRepository;
    private final AuthService authService;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final MemberSuggestionService memberSuggestionService;
    private final GroupChallengeRepository groupChallengeRepository;
    private final ApplicationEventPublisher eventPublisher; // Dùng để đẩy notification event

    /**
     * Lấy thông tin thành viên đã xác thực hiện tại.
     *
     * @return Member thành viên đang xác thực
     * @throws ResponseStatusException nếu không tìm thấy thành viên
     */
    private Member getAuthenticatedMember() {
        return memberRepository.findById(authService.getMemberIdFromAuthentication())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên."));
    }

    /**
     * Gửi lời mời tham gia thử thách cho danh sách thành viên.
     * Sử dụng Stream để lọc bỏ những member đã tham gia thử thách với status JOINED.
     *
     * @param request Chứa thông tin ID thử thách và danh sách ID thành viên được mời
     * @return Thông báo kết quả gửi lời mời, bao gồm số lượng lời mời gửi thành công hoặc thông báo nếu thử thách không ở trạng thái UPCOMING
     * @throws ResponseStatusException nếu không tìm thấy thử thách
     */
    @Override
    @Transactional
    public String sendInvitation(InviteMemberRequest request) {
        Member invitedBy = getAuthenticatedMember();
        Challenge challenge = challengeRepository.findById(request.getChallengeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thử thách."));

        LocalDateTime now = LocalDateTime.now();
        String type = request.getType();

        if ("MEMBER".equalsIgnoreCase(type)) {
            ChallengeMemberStatus status = (challenge.getStatus() != ChallengeStatus.UPCOMING)
                    ? ChallengeMemberStatus.EXPIRED : ChallengeMemberStatus.WAITING;

            List<ChallengeMember> invitations = memberRepository.findAllById(request.getMemberIds())
                    .stream()
                    .filter(member -> challengeMemberRepository.findByMemberAndChallenge(member, challenge)
                            .map(cm -> cm.getStatus() != ChallengeMemberStatus.JOINED)
                            .orElse(true))
                    .map(member -> ChallengeMember.builder()
                            .challenge(challenge)
                            .member(member)
                            .role(ChallengeRole.MEMBER)
                            .status(status)
                            .joinBy(invitedBy.getId())
                            .createdAt(now)
                            .build())
                    .toList();

            challengeMemberRepository.saveAll(invitations);

            // Gửi thông báo cho từng thành viên được mời
            invitations.forEach(invite ->eventPublisher.publishEvent(new InvitationSentEvent(
                    invite.getMember().getId().toString(),
                    "notification.challengeInvitation.title",
                    "notification.challengeInvitation.content",
                    Map.of("challengeName", challenge.getName())
            )));

            return (status == ChallengeMemberStatus.EXPIRED)
                    ? "Thử thách không mở, lời mời cho thành viên đã hết hạn."
                    : "Lời mời đã được gửi thành công đến " + invitations.size() + " thành viên.";
        } else if ("LEADER".equalsIgnoreCase(type)) {
            GroupChallengeStatus groupStatus = (challenge.getStatus() == ChallengeStatus.UPCOMING)
                    ? GroupChallengeStatus.PENDING : GroupChallengeStatus.REJECTED;

            List<GroupChallenge> groupInvitations = request.getMemberIds().stream()
                    .map(leaderId -> GroupChallenge.builder()
                            .group(null)
                            .challenge(challenge)
                            .joinDate(now)
                            .status(groupStatus)
                            .isSuccess(false)
                            .createdAt(now)
                            .build())
                    .toList();

            groupChallengeRepository.saveAll(groupInvitations);

            // Gửi thông báo cho từng chủ nhóm được mời
            request.getMemberIds().forEach(leaderId -> eventPublisher.publishEvent(new InvitationSentEvent(
                    leaderId.toString(),
                    "notification.leaderChallengeInvitation.title",
                    "notification.leaderChallengeInvitation.content",
                    Map.of("challengeName", challenge.getName())

            )));

            return (groupStatus == GroupChallengeStatus.REJECTED)
                    ? "Thử thách không mở, lời mời cho nhóm đã bị từ chối."
                    : "Lời mời nhóm đã được gửi thành công đến " + groupInvitations.size() + " chủ nhóm.";
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại lời mời không hợp lệ: phải là MEMBER hoặc LEADER.");
    }

    /**
     * Xử lý phản hồi lời mời tham gia thử thách.
     * Nếu loại lời mời là PERSONAL thì xử lý theo ChallengeMember,
     * còn nếu là GROUP thì kiểm tra quyền Leader của nhóm và cập nhật trạng thái GroupChallenge,
     * sau đó thêm toàn bộ thành viên trong group vào ChallengeMember.
     *
     * @param request Dữ liệu phản hồi lời mời (loại lời mời, ID lời mời và hành động accept/reject)
     * @return Thông báo kết quả phản hồi lời mời
     * @throws ResponseStatusException nếu lời mời không tồn tại hoặc thành viên không có quyền phản hồi
     */
    @Override
    @Transactional
    public String respondToInvitation(InvitationRespondRequestDTO request) {
        Member currentMember = getAuthenticatedMember();
        boolean accept = Boolean.TRUE.equals(request.getAccept());

        if ("PERSONAL".equalsIgnoreCase(request.getInvitationType())) {
            return handlePersonalInvitation(request.getInvitationId(), currentMember, accept);
        } else if ("GROUP".equalsIgnoreCase(request.getInvitationType())) {
            if (accept && request.getGroupId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần cung cấp ID nhóm.");
            }
            return handleGroupInvitation(request.getInvitationId(), currentMember, accept, request.getGroupId());
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại lời mời không hợp lệ.");
        }
    }

    /**
     * Xử lý lời mời cá nhân (member tự chấp nhận/từ chối).
     */
    private String handlePersonalInvitation(Long invitationId, Member member, boolean accept) {
        ChallengeMember invitation = challengeMemberRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lời mời không tồn tại."));

        if (!invitation.getMember().equals(member)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không được phép phản hồi lời mời này.");
        }

        if (accept) {
            if (invitation.getChallenge().getStatus() != ChallengeStatus.UPCOMING) {
                invitation.setStatus(ChallengeMemberStatus.EXPIRED);
            } else {
                invitation.setStatus(ChallengeMemberStatus.JOINED);
            }
        } else {
            invitation.setStatus(ChallengeMemberStatus.REJECTED);
        }

        invitation.setUpdatedAt(LocalDateTime.now());
        challengeMemberRepository.save(invitation);

        return accept ? "Lời mời cá nhân đã được chấp nhận." : "Lời mời cá nhân đã bị từ chối.";
    }

    /**
     * Xử lý lời mời nhóm (Leader chấp nhận -> thêm thành viên nhóm vào thử thách).
     */
    private String handleGroupInvitation(Long invitationId, Member member, boolean accept, Long selectedGroupId) {
        GroupChallenge groupChallenge = groupChallengeRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lời mời nhóm không tồn tại."));

        if (!accept) {
            groupChallenge.setStatus(GroupChallengeStatus.REJECTED);
            groupChallenge.setUpdatedAt(LocalDateTime.now());
            groupChallengeRepository.save(groupChallenge);
            return "Lời mời nhóm đã bị từ chối.";
        }

        Challenge challenge = groupChallenge.getChallenge();
        if (challenge.getStatus() != ChallengeStatus.UPCOMING) {
            groupChallenge.setStatus(GroupChallengeStatus.REJECTED);
            groupChallenge.setUpdatedAt(LocalDateTime.now());
            groupChallengeRepository.save(groupChallenge);
            return "Không thể tham gia. Thử thách không khả dụng.";
        }

        Groups group = groupRepository.findById(selectedGroupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm."));

        groupChallenge.setGroup(group);
        groupChallenge.setStatus(GroupChallengeStatus.ONGOING);
        groupChallenge.setUpdatedAt(LocalDateTime.now());
        groupChallengeRepository.save(groupChallenge);

        // Thêm tất cả thành viên trong nhóm vào thử thách
        List<ChallengeMember> newChallengeMembers = group.getMembers().stream()
                .map(GroupMember::getMember)
                .filter(groupMember -> !challengeMemberRepository.existsByChallengeAndMember(challenge, groupMember))
                .map(groupMember -> ChallengeMember.builder()
                        .challenge(challenge)
                        .member(groupMember)
                        .role(ChallengeRole.MEMBER)
                        .status(ChallengeMemberStatus.JOINED)
                        .groupId(group.getId())
                        .joinBy(member.getId())
                        .createdAt(LocalDateTime.now())
                        .build())
                .toList();

        challengeMemberRepository.saveAll(newChallengeMembers);

        // Gửi thông báo cho từng thành viên trong nhóm
        newChallengeMembers.stream()
                .map(ChallengeMember::getMember)
                .map(Member::getId)
                .map(Object::toString)
                .forEach(memberId -> eventPublisher.publishEvent(
                        new InvitationSentEvent(
                                memberId,
                                "notification.groupJoinChallenge.title",
                                "notification.groupJoinChallenge.content",
                                Map.of(
                                        "groupName", group.getName(),
                                        "challengeName", challenge.getName()
                                )

                        )
                ));



        return "Lời mời nhóm đã được chấp nhận.";
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

        // Lấy lời mời cá nhân, nhóm theo thử thách và chỉ lấy khi tất cả đều có status WAITING
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
                                    .orElse("Không xác định"))
                            .toList();
                    String inviterDisplay = (inviterNames.size() == 1) ? inviterNames.get(0) : "Nhiều người mời";
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

        // Lấy lời mời nhóm đối với các nhóm có thành viên với vai trò OWNER và status ACTIVE
        List<InvitationResponseDTO> groupInvitations = groupMemberRepository.findByMemberAndRoleAndStatus(member, "OWNER", GroupMemberStatus.ACTIVE)
                .stream()
                .flatMap(gm -> groupChallengeRepository.findByGroupAndStatus(gm.getGroup(), GroupChallengeStatus.PENDING).stream())
                .map(gc -> new InvitationResponseDTO(
                        gc.getChallenge().getId(),
                        gc.getId(),
                        gc.getChallenge().getName(),
                        "Lời mời nhóm: " + gc.getGroup().getName(),
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
     * @throws ResponseStatusException nếu không tìm thấy thử thách hoặc nhóm
     */
    @Override
    public String sendGroupInvitationToChallenge(InviteGroupToChallengeRequest request) {
        Member invitedBy = getAuthenticatedMember();
        Challenge challenge = challengeRepository.findById(request.getChallengeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thử thách."));
        Groups group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm."));

        // Xác định trạng thái lời mời theo trạng thái của thử thách
        ChallengeMemberStatus status = (challenge.getStatus() != ChallengeStatus.UPCOMING)
                ? ChallengeMemberStatus.EXPIRED : ChallengeMemberStatus.WAITING;
        LocalDateTime now = LocalDateTime.now();

        // Lấy danh sách thành viên ACTIVE trong nhóm (trừ người gửi)
        List<Member> groupMembers = groupMemberRepository.findMembersByGroupIdAndStatus(group.getId(), GroupMemberStatus.ACTIVE)
                .stream()
                .filter(member -> !member.getId().equals(invitedBy.getId()))
                .collect(Collectors.toList());

        List<ChallengeMember> invitations = createInvitationsForChallenge(challenge, groupMembers, invitedBy.getId(), status, now);
        challengeMemberRepository.saveAll(invitations);

        return (status == ChallengeMemberStatus.EXPIRED)
                ? "Thử thách không mở, tất cả lời mời đã hết hạn."
                : "Lời mời đã được gửi thành công đến " + invitations.size() + " thành viên trong nhóm.";
    }

    /**
     * Tạo danh sách lời mời tham gia thử thách cho danh sách thành viên.
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
                    // Nếu đã tham gia rồi thì loại bỏ
                    if (existing.isPresent() && existing.get().getStatus() == ChallengeMemberStatus.JOINED) return false;
                    // Kiểm tra quyền mời: nếu là NO_ONE thì bỏ qua;
                    // nếu là SAME_GROUP thì chỉ cho phép khi có nhóm chung
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
