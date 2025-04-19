package org.capstone.backend.service.group;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.challenge.GroupChallengeHistoryDTO;
import org.capstone.backend.dto.group.*;
import org.capstone.backend.entity.*;
import org.capstone.backend.event.InvitationSentEvent;
import org.capstone.backend.repository.*;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.GroupChallengeStatus;
import org.capstone.backend.utils.enums.GroupMemberStatus;
import org.capstone.backend.utils.enums.InvitePermission;
import org.capstone.backend.utils.enums.NotificationType;
import org.capstone.backend.utils.upload.FirebaseUpload;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final MemberRepository memberRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final FirebaseUpload firebaseUpload;
    private final AuthService authService;
    private final GroupChallengeRepository groupChallengeRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final GlobalMemberRankingRepository groupRankingRepository;
    // ========================== GET ==========================

    @Override
    public List<GroupResponse> getGroupsByMemberId() {
        Long memberId = authService.getMemberIdFromAuthentication();
        return groupRepository.findByMemberId(memberId).stream()
                .map(group -> convertToDTO(group, memberId, false))
                .collect(Collectors.toList());
    }

    @Override
    public GroupResponse getGroupsDetail(Long groupId) {
        Long memberId = authService.getMemberIdFromAuthentication();
        Groups group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm với id " + groupId));

        // ✅ Check nếu không phải thành viên ACTIVE thì ném lỗi
        boolean isMember = group.getMembers().stream()
                .anyMatch(m -> m.getMember().getId().equals(memberId) && m.getStatus() == GroupMemberStatus.ACTIVE);

        if (!isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phải là thành viên của nhóm này.");
        }

        return convertToDTO(group, memberId, true);
    }


    private GroupResponse convertToDTO(Groups group, Long memberId, boolean includeMembers) {
        GroupResponse dto = new GroupResponse();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setPicture(group.getPicture());
        dto.setDescription(group.getDescription());
        dto.setCreatedAt(group.getCreatedAt());
        dto.setCreatedBy(group.getCreatedBy());
        dto.setUpdatedAt(group.getUpdatedAt());
        dto.setUpdatedBy(group.getUpdatedBy());

        if (includeMembers) {
            List<GroupMemberResponse> memberDTOs = group.getMembers().stream()
                    .map(this::convertToMemberDTO)
                    .collect(Collectors.toList());
            dto.setMembers(memberDTOs);
        }

        // ✅ Only count ACTIVE members
        dto.setCurrentParticipants(
                (int) group.getMembers().stream()
                        .filter(m -> m.getStatus() == GroupMemberStatus.ACTIVE)
                        .count()
        );

        group.getMembers().stream()
                .filter(m -> m.getMember().getId().equals(memberId))
                .findFirst()
                .ifPresent(matched -> dto.setCurrentMemberRole(matched.getRole()));

        return dto;
    }

    private GroupMemberResponse convertToMemberDTO(GroupMember groupMember) {
        Member member = memberRepository.findById(groupMember.getMember().getId())
                .orElse(null);

        return GroupMemberResponse.builder()
                .id(groupMember.getId())
                .memberId(groupMember.getMember().getId())
                .imageUrl(member != null ? member.getAvatar() : "https://example.com/default-avatar.png")
                .memberName(member != null ? member.getFullName() : "Không tìm thấy tên người dùng")
                .joinDate(groupMember.getMember().getCreatedAt())
                .role(groupMember.getRole())
                .status(groupMember.getStatus())
                .build();
    }

    @Override
    public List<GroupInvitationDTO> getPendingInvitations() {
        // Lấy thông tin thành viên từ Authentication Service
        Member member = memberRepository.findById(authService.getMemberIdFromAuthentication())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên."));

        // Lấy tất cả các lời mời đang chờ với trạng thái PENDING của thành viên này
        List<GroupMember> pendingInvitations = groupMemberRepository.findByMemberAndStatus(member, GroupMemberStatus.PENDING);

        // Chuyển đổi các GroupMember thành GroupInvitationDTO
        return pendingInvitations.stream()
                .map(invite -> {
                    String inviterName = memberRepository.findById(invite.getCreatedBy())
                            .map(Member::getFullName)
                            .orElse("Unknown");

                    return GroupInvitationDTO.builder()
                            .groupId(invite.getGroup().getId())                // Lấy ID nhóm
                            .name(member.getFullName())                        // Tên của người được mời (người đang đăng nhập)
                            .img(invite.getGroup().getPicture())              // Ảnh nhóm
                            .groupName(invite.getGroup().getName())           // Tên nhóm
                            .invitedBy(inviterName)                           // ✅ Tên người mời
                            .build();
                })
                .collect(Collectors.toList());


        // ========================== CREATE ==========================
    }
    @Override
    @Transactional
    public String createGroup(GroupRequest request, MultipartFile picture) {
        Long memberId = authService.getMemberIdFromAuthentication();
        String pictureUrl = uploadPicture(picture);

        Groups group = groupRepository.save(Groups.builder()
                .name(request.getName())
                .picture(pictureUrl)
                .description(request.getDescription())
                .createdBy(memberId)
                .build());

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên."));
        groupMemberRepository.save(GroupMember.builder()
                .group(group)
                .member(member)
                .role("OWNER")
                .status(GroupMemberStatus.ACTIVE)
                .createdBy(memberId)
                .build());

        return "Nhóm '" + group.getName() + "' đã được tạo thành công!";
    }

    private String uploadPicture(MultipartFile picture) {
        try {
            return (picture != null && !picture.isEmpty()) ? firebaseUpload.uploadFile(picture, "group") : null;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Tải lên thất bại: " + e.getMessage());
        }
    }

    // ========================== UPDATE ==========================

    @Override
    @Transactional
    public Groups updateGroup(Long groupId, GroupRequest request, MultipartFile picture) {
        // Tìm nhóm theo ID
        Groups group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm."));

        // Cập nhật tên và mô tả nhóm
        group.setName(request.getName());
        group.setDescription(request.getDescription());

        // Kiểm tra xem có ảnh mới không
        if (picture != null && !picture.isEmpty()) {
            // Nếu có ảnh mới, tải lên ảnh và cập nhật URL của ảnh vào nhóm
            String pictureUrl = uploadPicture(picture);
            group.setPicture(pictureUrl);  // Cập nhật ảnh mới
        }

        // Cập nhật người chỉnh sửa nhóm
        group.setUpdatedBy(authService.getMemberIdFromAuthentication());

        // Lưu nhóm đã được cập nhật và trả về
        return groupRepository.save(group);
    }
    // ========================== ACTION ==========================

    @Override
    public void kickMember(Long groupId, Long memberId) {
        Groups group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm."));
        if (!Objects.equals(group.getCreatedBy(), authService.getMemberIdFromAuthentication())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xóa thành viên ra khỏi nhóm này.");
        }
        GroupMember memberToKick = groupMemberRepository.findByGroupIdAndMemberIdAndStatus(groupId, memberId, GroupMemberStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên trong nhóm này."));
        memberToKick.setStatus(GroupMemberStatus.BANNED);
        eventPublisher.publishEvent(new InvitationSentEvent(
                memberId.toString(),
                "Bạn đã bị kick khỏi nhóm",
                "Bạn đã bị quản trị viên xóa khỏi nhóm '" + group.getName() + "'.",
                NotificationType.SYSTEM_NOTIFICATION
        ));
        groupMemberRepository.save(memberToKick);
    }

    @Override
    public void leaveGroup(Long groupId) {
        GroupMember groupMember = groupMemberRepository.findByGroupIdAndMemberIdAndStatus(
                        groupId,
                        authService.getMemberIdFromAuthentication(),
                        GroupMemberStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bạn không phải là thành viên của nhóm này."));
        groupMember.setStatus(GroupMemberStatus.LEFT);
        groupMemberRepository.save(groupMember);
    }

    // ========================== INVITATION ==========================

    @Override
    public void inviteMembers(GroupInviteRequest request) {
        // Tìm nhóm
        Groups group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm."));

        // Tìm các thành viên được mời
        List<Member> membersToInvite = memberRepository.findAllById(request.getMemberIds());
        if (membersToInvite.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không tìm thấy thành viên với ID được cung cấp.");
        }

        // Tạo danh sách lời mời hoặc cập nhật trạng thái thành viên
        List<GroupMember> invitations = membersToInvite.stream()
                .map(member -> {
                    // Kiểm tra xem thành viên đã tham gia nhóm chưa
                    GroupMember existingMember = groupMemberRepository.findByGroupAndMember(group, member).orElse(null);

                    if (existingMember == null) {
                        // Nếu thành viên chưa tham gia nhóm, tạo mới lời mời
                        return GroupMember.builder()
                                .group(group)
                                .member(member)
                                .role("MEMBER")
                                .status(GroupMemberStatus.PENDING) // Trạng thái lời mời
                                .createdBy(group.getCreatedBy())
                                .build();
                    } else if (existingMember.getStatus() == GroupMemberStatus.LEFT) {
                        // Nếu thành viên đã rời nhóm (status = LEFT), thay đổi trạng thái thành PENDING
                        existingMember.setStatus(GroupMemberStatus.PENDING);
                        return existingMember; // Trả về bản ghi đã cập nhật
                    }
                    // Nếu thành viên đang ở trạng thái khác, không thay đổi gì
                    return null;
                })
                .filter(Objects::nonNull) // Loại bỏ các phần tử null
                .collect(Collectors.toList());

        // Lưu các lời mời hoặc cập nhật vào cơ sở dữ liệu
        if (!invitations.isEmpty()) {
            groupMemberRepository.saveAll(invitations);
        }
    }


    @Override
    public void respondToInvitation(Long groupId, GroupMemberStatus status) {
        Member member = memberRepository.findById(authService.getMemberIdFromAuthentication())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên."));
        Groups group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm."));
        GroupMember groupMember = groupMemberRepository.findByGroupAndMember(group, member)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lời mời."));
        groupMember.setStatus(status == GroupMemberStatus.ACCEPTED ? GroupMemberStatus.ACTIVE : status);
        groupMemberRepository.save(groupMember);
    }

    // ========================== SEARCH ==========================

    @Override
    public List<MemberSearchResponse> searchMembers(MemberSearchRequest request) {
        Pageable pageable = PageRequest.of(0, 20); // Lấy nhiều hơn 5 để đủ sau khi filter
        Page<Member> memberPage = memberRepository.searchMembersByKeyword(request.getKeyword(), pageable);
        Long currentMemberId = authService.getMemberIdFromAuthentication();
        List<Member> members = memberPage.getContent();
        List<Long> memberIds = members.stream()
                .map(Member::getId)
                .filter(id -> !id.equals(currentMemberId))
                .collect(Collectors.toList());
        List<Long> commonGroupMemberIds = groupMemberRepository.findCommonGroupMemberIds(currentMemberId, memberIds);
        List<Long> alreadyJoinedMemberIds = groupMemberRepository.findAlreadyJoinedActiveMemberIds(currentMemberId, memberIds);
        return members.stream()
                .filter(m -> !m.getId().equals(currentMemberId))
                .filter(m -> {
                    InvitePermission permission = m.getInvitePermission();
                    if (permission == InvitePermission.NO_ONE) {
                        return false;
                    }
                    if (permission == InvitePermission.SAME_GROUP) {
                        return commonGroupMemberIds.contains(m.getId()) && !alreadyJoinedMemberIds.contains(m.getId());
                    }
                    if (permission == InvitePermission.EVERYONE) {
                        return !alreadyJoinedMemberIds.contains(m.getId());
                    }
                    return false;
                })
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

    @Override
    public Page<GroupSummaryDTO> searchGroups(String keyword, int page, int size) {
        return groupRepository.searchGroupsByName(keyword, PageRequest.of(page, size));
    }

    @Override
    @Transactional
    public void disbandGroup(Long groupId) {
        Long memberId = authService.getMemberIdFromAuthentication(); // null nếu là admin
        Groups group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nhóm không tồn tại."));
        if (memberId != null) {
            GroupMember host = groupMemberRepository.findByGroupIdAndMemberId(groupId, memberId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không tham gia nhóm này."));
            if (!Objects.equals(host.getMember().getId(), group.getCreatedBy())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ host hoặc admin mới có quyền giải tán nhóm.");
            }
        }
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        members.forEach(m -> {
            eventPublisher.publishEvent(new InvitationSentEvent(
                    m.getMember().getId().toString(),
                    "Nhóm đã bị giải tán",
                    "Nhóm '" + group.getName() + "' đã bị giải tán.",
                    NotificationType.SYSTEM_NOTIFICATION
            ));
        });
        groupMemberRepository.deleteByGroupId(groupId);
        groupRepository.delete(group);
    }

    @Override
    public List<AvailableGroupResponse> getAvailableGroupsToJoinChallenge() {
        Long memberId = authService.getMemberIdFromAuthentication();
        List<Groups> groups = groupMemberRepository.findAvailableGroupsForMember(memberId);
        return groups.stream()
                .map(group -> new AvailableGroupResponse(
                        group.getId(),
                        group.getName(),
                        group.getPicture()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public Page<GroupChallengeHistoryDTO> getGroupChallengeHistories(Long groupId, GroupChallengeStatus status, int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("joinDate").descending());
        return groupChallengeRepository.findGroupChallengeHistories(groupId, status, pageable);
    }

    @Override
    public Page<GroupMemberRankingDTO> getGroupMemberRanking(Long groupId, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return groupMemberRepository.searchGroupRankingWithKeyword(groupId, keyword == null ? "" : keyword, pageable);
    }


}


