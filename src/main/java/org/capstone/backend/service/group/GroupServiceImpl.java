package org.capstone.backend.service.group;

import com.google.monitoring.v3.Group;
import jakarta.persistence.EntityNotFoundException;
import org.capstone.backend.dto.group.*;
import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.GroupMemberStatus;
import org.capstone.backend.utils.enums.InvitePermission;
import org.capstone.backend.utils.upload.FirebaseUpload;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final MemberRepository memberRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final AccountRepository accountRepository;
    private final FirebaseUpload firebaseUpload;
    private final AuthService authService;

    public GroupServiceImpl(GroupRepository groupRepository,
                            MemberRepository memberRepository,
                            GroupMemberRepository groupMemberRepository,
                            AccountRepository accountRepository,
                            FirebaseUpload firebaseUpload,
                            AuthService authService) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.accountRepository = accountRepository;
        this.firebaseUpload = firebaseUpload;
        this.authService = authService;
    }

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
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id " + groupId));
        return convertToDTO(group, memberId, true);
    }

    private GroupResponse convertToDTO(Groups group, Long memberId, boolean includeMembers) {
        GroupResponse dto = new GroupResponse();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setMaxParticipants(group.getMaxParticipants());
        dto.setPicture(group.getPicture());
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

        dto.setCurrentParticipants(group.getMembers().size());

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
                .memberName(member != null ? member.getFullName() : "User name not found")
                .joinDate(groupMember.getMember().getCreatedAt())
                .role(groupMember.getRole())
                .status(groupMember.getStatus())
                .build();
    }

    @Override
    public List<GroupInvitationDTO> getPendingInvitations() {
        Member member = memberRepository.findById(authService.getMemberIdFromAuthentication())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        return groupMemberRepository.findByMemberAndStatus(member, GroupMemberStatus.PENDING).stream()
                .map(invite -> GroupInvitationDTO.builder()
                        .groupId(invite.getGroup().getId())
                        .name(member.getFullName())
                        .img(invite.getGroup().getPicture())
                        .groupName(invite.getGroup().getName())
                        .invitedBy(invite.getCreatedBy().toString())
                        .build())
                .collect(Collectors.toList());
    }

    // ========================== CREATE ==========================

    @Override
    @Transactional
    public Groups createGroup(GroupRequest request, MultipartFile picture) {
        Long memberId = authService.getMemberIdFromAuthentication();
        String pictureUrl = uploadPicture(picture);

        Groups group = groupRepository.save(Groups.builder()
                .name(request.getName())
                .maxParticipants(request.getMaxParticipants())
                .picture(pictureUrl)
                .createdBy(memberId)
                .build());

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        groupMemberRepository.save(GroupMember.builder()
                .group(group)
                .member(member)
                .role("OWNER")
                .status(GroupMemberStatus.ACTIVE)
                .createdBy(memberId)
                .build());

        return group;
    }

    private String uploadPicture(MultipartFile picture) {
        try {
            return (picture != null && !picture.isEmpty()) ? firebaseUpload.uploadFile(picture, "group") : null;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload failed: " + e.getMessage());
        }
    }

    // ========================== UPDATE ==========================

    @Override
    public Groups updateGroup(Long groupId, GroupRequest request) {
        Groups group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        group.setName(request.getName());
        group.setMaxParticipants(request.getMaxParticipants());
        group.setUpdatedBy(authService.getMemberIdFromAuthentication());
        return groupRepository.save(group);
    }

    // ========================== ACTION ==========================

    @Override
    public void kickMember(Long groupId, Long memberId) {
        Groups group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        if (!Objects.equals(group.getCreatedBy(), authService.getMemberIdFromAuthentication())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to kick members from this group");
        }

        GroupMember memberToKick = groupMemberRepository.findByGroupIdAndMemberIdAndStatus(groupId, memberId, GroupMemberStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found in this group"));

        memberToKick.setStatus(GroupMemberStatus.BANNED);
        groupMemberRepository.save(memberToKick);
    }

    @Override
    public void leaveGroup(Long groupId) {
        GroupMember groupMember = groupMemberRepository.findByGroupIdAndMemberIdAndStatus(
                        groupId,
                        authService.getMemberIdFromAuthentication(),
                        GroupMemberStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "You are not a member of this group"));

        groupMember.setStatus(GroupMemberStatus.LEFT);
        groupMemberRepository.save(groupMember);
    }

    // ========================== INVITATION ==========================

    @Override
    public void inviteMembers(GroupInviteRequest request) {
        Groups group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        List<Member> membersToInvite = memberRepository.findAllById(request.getMemberIds());
        if (membersToInvite.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No members found with provided IDs");
        }

        List<GroupMember> invitations = membersToInvite.stream()
                .filter(member -> !groupMemberRepository.existsByGroupAndMember(group, member))
                .map(member -> GroupMember.builder()
                        .group(group)
                        .member(member)
                        .role("MEMBER")
                        .status(GroupMemberStatus.PENDING)
                        .createdBy(group.getCreatedBy())
                        .build())
                .collect(Collectors.toList());

        if (!invitations.isEmpty()) {
            groupMemberRepository.saveAll(invitations);
        }
    }

    @Override
    public void respondToInvitation(Long groupId, GroupMemberStatus status) {
        Member member = memberRepository.findById(authService.getMemberIdFromAuthentication())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        Groups group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        GroupMember groupMember = groupMemberRepository.findByGroupAndMember(group, member)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

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

        // Lấy danh sách ID của các member (loại bỏ currentMemberId)
        List<Long> memberIds = members.stream()
                .map(Member::getId)
                .filter(id -> !id.equals(currentMemberId))
                .toList();

        // Batch query với check trạng thái ACTIVE cho GroupMemberStatus
        List<Long> commonGroupMemberIds = groupMemberRepository.findCommonGroupMemberIds(currentMemberId, memberIds);
        List<Long> alreadyJoinedMemberIds = groupMemberRepository.findAlreadyJoinedActiveMemberIds(currentMemberId, memberIds);

        // Lọc danh sách member theo InvitePermission và loại bỏ những người đã gia nhập nhóm (với trạng thái ACTIVE)
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
                        m.getFullName()
                ))
                .toList();
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
            // Member đang đăng nhập → phải là HOST mới được giải tán nhóm
            GroupMember host = groupMemberRepository.findByGroupIdAndMemberId(groupId, memberId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không tham gia nhóm này."));

            if (!Objects.equals(host.getId(), group.getCreatedBy())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ host hoặc admin mới có quyền giải tán nhóm.");
            }
        }

        // ✅ Nếu là Admin (memberId == null) hoặc là Host → cho phép xóa
        groupMemberRepository.deleteByGroupId(groupId); // Xóa tất cả thành viên
        groupRepository.delete(group); // Xóa nhóm
    }


}
