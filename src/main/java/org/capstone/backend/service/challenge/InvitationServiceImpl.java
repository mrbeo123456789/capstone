package org.capstone.backend.service.challenge;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.dto.group.MemberSearchResponse;
import org.capstone.backend.entity.*;
import org.capstone.backend.event.FirstJoinChallengeEvent;
import org.capstone.backend.event.InvitationSentEvent;
import org.capstone.backend.event.TrendingChallengeReachedEvent;
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

        // Cho phép invite khi UPCOMING hoặc PENDING
        boolean canInvite = challenge.getStatus() == ChallengeStatus.UPCOMING
                || challenge.getStatus() == ChallengeStatus.PENDING;

        if ("MEMBER".equalsIgnoreCase(type)) {
            // Nếu đang UPCOMING/PENDING thì WAITING, ngược lại EXPIRED
            ChallengeMemberStatus status = canInvite
                    ? ChallengeMemberStatus.WAITING
                    : ChallengeMemberStatus.EXPIRED;

            List<ChallengeMember> invitations = memberRepository.findAllById(request.getMemberIds())
                    .stream()
                    .map(member -> {
                        Optional<ChallengeMember> existing = challengeMemberRepository.findByMemberAndChallenge(member, challenge);
                        if (existing.isPresent()) {
                            ChallengeMember cm = existing.get();
                            if (cm.getStatus() == ChallengeMemberStatus.JOINED) return null;
                            cm.setStatus(status);
                            cm.setJoinBy(invitedBy.getId());
                            cm.setUpdatedAt(now);
                            return cm;
                        }
                        return ChallengeMember.builder()
                                .challenge(challenge)
                                .member(member)
                                .role(ChallengeRole.MEMBER)
                                .status(status)
                                .joinBy(invitedBy.getId())
                                .createdAt(now)
                                .build();
                    })
                    .filter(Objects::nonNull)
                    .toList();

            challengeMemberRepository.saveAll(invitations);
            invitations.forEach(invite -> eventPublisher.publishEvent(new InvitationSentEvent(
                    invite.getMember().getId().toString(),
                    "notification.challengeInvitation.title",
                    "notification.challengeInvitation.content",
                    Map.of("challengeName", challenge.getName())
            )));

            return canInvite
                    ? "Lời mời đã được gửi thành công đến " + invitations.size() + " thành viên."
                    : "Thử thách không mở, lời mời cho thành viên đã hết hạn.";
        }
        else if ("LEADER".equalsIgnoreCase(type)) {
            GroupChallengeStatus groupStatus = canInvite
                    ? GroupChallengeStatus.PENDING
                    : GroupChallengeStatus.REJECTED;

            // 1. Gửi GroupChallenge (phải fetch leader trước)
            List<GroupChallenge> groupInvitations = request.getMemberIds().stream()
                    .map(leaderId -> {
                        Member leader = memberRepository.findById(leaderId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy leader với ID: " + leaderId));
                        return GroupChallenge.builder()
                                .group(null)
                                .challenge(challenge)
                                .joinDate(now)
                                .status(groupStatus)
                                .isSuccess(false)
                                .createdAt(now)
                                .invitedMemberId(leader.getId()) // ✅ Gắn đúng invitedMemberId
                                .build();
                    })
                    .toList();
            groupChallengeRepository.saveAll(groupInvitations);

            // 2. Gửi ChallengeMember cho leader
            ChallengeMemberStatus leaderStatus = canInvite
                    ? ChallengeMemberStatus.WAITING
                    : ChallengeMemberStatus.EXPIRED;

            List<ChallengeMember> leaderChallengeMembers = request.getMemberIds().stream()
                    .map(leaderId -> {
                        Member leader = memberRepository.findById(leaderId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy leader với ID: " + leaderId));
                        return ChallengeMember.builder()
                                .challenge(challenge)
                                .member(leader)
                                .role(ChallengeRole.MEMBER)
                                .status(leaderStatus)
                                .joinBy(invitedBy.getId())
                                .isParticipate(false)
                                .createdAt(now)
                                .build();
                    })
                    .toList();
            challengeMemberRepository.saveAll(leaderChallengeMembers);

            request.getMemberIds().forEach(leaderId -> eventPublisher.publishEvent(new InvitationSentEvent(
                    leaderId.toString(),
                    "notification.leaderChallengeInvitation.title",
                    "notification.leaderChallengeInvitation.content",
                    Map.of("challengeName", challenge.getName())
            )));

            return canInvite
                    ? "Lời mời nhóm đã được gửi thành công đến " + groupInvitations.size() + " chủ nhóm."
                    : "Thử thách không mở, lời mời cho nhóm đã bị từ chối.";
        }



        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Loại lời mời không hợp lệ: phải là MEMBER hoặc LEADER.");
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
    // Personal invitation
    private String handlePersonalInvitation(Long invitationId, Member member, boolean accept) {
        ChallengeMember invitation = challengeMemberRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lời mời không tồn tại."));

        if (!invitation.getMember().equals(member)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không được phép phản hồi lời mời này.");
        }

        if (accept) {
            ChallengeStatus st = invitation.getChallenge().getStatus();
            // Cho phép JOINED khi UPCOMING hoặc PENDING
            if (st == ChallengeStatus.UPCOMING || st == ChallengeStatus.PENDING) {
                invitation.setStatus(ChallengeMemberStatus.JOINED);
                eventPublisher.publishEvent(new FirstJoinChallengeEvent(member));
                Member host = memberRepository.findByUsername(invitation.getChallenge().getCreatedBy())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy host từ username"));

                long count = challengeMemberRepository.countJoinedByChallenge(invitation.getChallenge().getId());

                eventPublisher.publishEvent(new TrendingChallengeReachedEvent(host, count));

            } else {
                invitation.setStatus(ChallengeMemberStatus.EXPIRED);
            }
        } else {
            invitation.setStatus(ChallengeMemberStatus.REJECTED);
        }

        invitation.setUpdatedAt(LocalDateTime.now());
        challengeMemberRepository.save(invitation);
        return accept
                ? "Lời mời cá nhân đã được chấp nhận."
                : "Lời mời cá nhân đã bị từ chối.";
    }

    // Group invitation
    @Transactional
    public String handleGroupInvitation(Long invitationId, Member member, boolean accept, Long selectedGroupId) {
        ChallengeMember invitation = challengeMemberRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lời mời không tồn tại."));

        Challenge challenge = invitation.getChallenge();

        GroupChallenge groupChallenge = groupChallengeRepository
                .findByChallengeIdAndInvitedMemberId(challenge.getId(), member.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lời mời nhóm phù hợp."));

        if (!accept) {
            groupChallenge.setStatus(GroupChallengeStatus.REJECTED);
            groupChallenge.setUpdatedAt(LocalDateTime.now());
            groupChallengeRepository.save(groupChallenge);

            invitation.setStatus(ChallengeMemberStatus.REJECTED);
            invitation.setUpdatedAt(LocalDateTime.now());
            challengeMemberRepository.save(invitation);

            return "Lời mời nhóm đã bị từ chối.";
        }

        if (challenge.getStatus() != ChallengeStatus.UPCOMING && challenge.getStatus() != ChallengeStatus.PENDING) {
            groupChallenge.setStatus(GroupChallengeStatus.REJECTED);
            groupChallenge.setUpdatedAt(LocalDateTime.now());
            groupChallengeRepository.save(groupChallenge);

            invitation.setStatus(ChallengeMemberStatus.EXPIRED);
            invitation.setUpdatedAt(LocalDateTime.now());
            challengeMemberRepository.save(invitation);

            return "Không thể tham gia. Thử thách không khả dụng.";
        }

        Groups group = groupRepository.findById(selectedGroupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm."));

        // 🔍 Kiểm tra xung đột thành viên đã tham gia thử thách
        List<Member> groupMembers = groupMemberRepository
                .findMembersByGroupIdAndStatus(group.getId(), GroupMemberStatus.ACTIVE);

        List<String> conflicted = groupMembers.stream()
                .filter(m -> challengeMemberRepository.existsByChallengeAndMember(challenge, m))
                .map(Member::getFullName)
                .toList();

        if (!conflicted.isEmpty()) {
            String firstName = conflicted.get(0);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "MEMBER_ALREADY_JOINED:" + firstName); // 👈 Gắn prefix dễ parse ở FE
        }

        // ✅ Cập nhật trạng thái lời mời và GroupChallenge
        groupChallenge.setGroup(group);
        groupChallenge.setStatus(GroupChallengeStatus.ONGOING);
        groupChallenge.setUpdatedAt(LocalDateTime.now());
        groupChallengeRepository.save(groupChallenge);

        invitation.setStatus(ChallengeMemberStatus.JOINED);
        invitation.setGroupId(group.getId());
        invitation.setUpdatedAt(LocalDateTime.now());
        eventPublisher.publishEvent(new FirstJoinChallengeEvent(invitation.getMember()));

        challengeMemberRepository.save(invitation);

        // 🔁 Tạo ChallengeMember cho các thành viên nhóm chưa có
        LocalDateTime now = LocalDateTime.now();
        List<ChallengeMember> newCms = groupMembers.stream()
                .map(m -> ChallengeMember.builder()
                        .challenge(challenge)
                        .member(m)
                        .role(ChallengeRole.MEMBER)
                        .status(ChallengeMemberStatus.JOINED)
                        .groupId(group.getId())
                        .joinBy(member.getId())
                        .isParticipate(true)
                        .createdAt(now)
                        .build())
                .toList();

        challengeMemberRepository.saveAll(newCms);
// 🔔 Bắn sự kiện FirstJoinChallenge cho từng thành viên
        newCms.forEach(cm -> {
            eventPublisher.publishEvent(new FirstJoinChallengeEvent(cm.getMember()));
        });
        long count = challengeMemberRepository.countJoinedByChallenge(invitation.getChallenge().getId());
        Member host = memberRepository.findByUsername(invitation.getChallenge().getCreatedBy())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy host từ username"));
        eventPublisher.publishEvent(new TrendingChallengeReachedEvent(host, count));
        // 🔔 Gửi thông báo
        newCms.forEach(cm -> eventPublisher.publishEvent(
                new InvitationSentEvent(
                        cm.getMember().getId().toString(),
                        "notification.groupJoinChallenge.title",
                        "notification.groupJoinChallenge.content",
                        Map.of("groupName", group.getName(), "challengeName", challenge.getName())
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
    @Transactional(readOnly = true)
    public List<InvitationResponseDTO> getInvitationsForMember() {
        Member member = getAuthenticatedMember();

        List<ChallengeMember> waitingInvitations = challengeMemberRepository.findByMemberAndStatus(member, ChallengeMemberStatus.WAITING);

        return waitingInvitations.stream()
                .map(cm -> {
                    Challenge challenge = cm.getChallenge();
                    String inviterName = memberRepository.findById(cm.getJoinBy())
                            .map(Member::getFullName)
                            .orElse("Không xác định");

                    String type = challenge.getParticipationType() == ParticipationType.GROUP ? "GROUP" : "PERSONAL";

                    return new InvitationResponseDTO(
                            challenge.getId(),
                            cm.getId(),
                            challenge.getName(),
                            inviterName,
                            challenge.getPicture(),
                            type
                    );
                })
                .toList();
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

        ChallengeMemberStatus status = (challenge.getStatus() != ChallengeStatus.UPCOMING)
                ? ChallengeMemberStatus.EXPIRED : ChallengeMemberStatus.WAITING;
        LocalDateTime now = LocalDateTime.now();

        // Duyệt qua từng groupId để lấy thành viên ACTIVE
        Set<Member> allGroupMembers = new HashSet<>();
        for (Long groupId : request.getGroupIds()) {


            List<Member> members = groupMemberRepository.findMembersByGroupIdAndStatus(groupId, GroupMemberStatus.ACTIVE);
            for (Member member : members) {
                if (!member.getId().equals(invitedBy.getId())) {
                    allGroupMembers.add(member); // dùng Set để tránh trùng người
                }
            }
        }

        List<ChallengeMember> invitations = createInvitationsForChallenge(
                challenge,
                new ArrayList<>(allGroupMembers),
                invitedBy.getId(),
                status,
                now
        );
        invitations.forEach(invite -> {
            if (invite.getRole() == null) {
                invite.setRole(ChallengeRole.MEMBER); // Hoặc enum ChallengeRole.MEMBER nếu bạn dùng Enum
            }
        });
        challengeMemberRepository.saveAll(invitations);

        return (status == ChallengeMemberStatus.EXPIRED)
                ? "Thử thách không mở, tất cả lời mời đã hết hạn."
                : "Lời mời đã được gửi thành công đến " + invitations.size() + " thành viên trong các nhóm.";
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

        String creatorUsername = challengeRepository.findById(challengeId)
                .map(Challenge::getCreatedBy)
                .orElseThrow(() -> new EntityNotFoundException("Challenge not found"));

        Long creatorMemberId = memberRepository.findMemberIdByUsername(creatorUsername)
                .orElseThrow(() -> new EntityNotFoundException("Member not found with username: " + creatorUsername));

        return groupMemberRepository.searchAvailableGroupLeaders(
                challengeId,
                keyword,
                GroupMemberStatus.ACTIVE,
                GroupChallengeStatus.PENDING,
                GroupChallengeStatus.ONGOING,
                InvitePermission.EVERYONE,
                currentMemberId,
                creatorMemberId,
                pageable
        );
    }



}
