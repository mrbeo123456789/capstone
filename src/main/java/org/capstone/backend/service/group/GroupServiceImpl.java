package org.capstone.backend.service.group;

import jakarta.persistence.EntityNotFoundException;
import org.capstone.backend.dto.group.*;
import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.GroupMember;
import org.capstone.backend.entity.Groups;

import org.capstone.backend.dto.group.GroupRequest;
import org.capstone.backend.entity.Member;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.repository.GroupMemberRepository;
import org.capstone.backend.repository.GroupRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.service.group.GroupService;
import org.capstone.backend.utils.enums.GroupMemberStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.capstone.backend.utils.upload.FirebaseUpload;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final MemberRepository memberRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final AccountRepository accountRepository;
    private final FirebaseUpload firebaseUpload;

    public GroupServiceImpl(GroupRepository groupRepository,
                            MemberRepository memberRepository,
                            GroupMemberRepository groupMemberRepository,
                            AccountRepository accountRepository,
                            FirebaseUpload firebaseUpload) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.accountRepository = accountRepository;
        this.firebaseUpload = firebaseUpload;
    }

    @Override
    public List<GroupResponse> getGroupsByMemberId(Long memberId) {
        List<Groups> groups = groupRepository.findByMemberId(memberId);
        return groups.stream()
                .map(group -> convertToDTO(group, memberId))
                .collect(Collectors.toList());
    }

    @Override
    public GroupResponse getGroupsDetail(Long groupId, Long memberId) {
        return groupRepository.findById(groupId)
                .map(group -> convertToGroupDetail(group, memberId))
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id " + groupId));
    }


    private GroupResponse convertToDTO(Groups group, Long currentMemberId) {
        GroupResponse dto = new GroupResponse();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setMaxParticipants(group.getMaxParticipants());
        dto.setPicture(group.getPicture());
        dto.setCreatedAt(group.getCreatedAt());
        dto.setCreatedBy(group.getCreatedBy());
        dto.setUpdatedAt(group.getUpdatedAt());
        dto.setUpdatedBy(group.getUpdatedBy());

        // Member list
        List<GroupMemberResponse> memberDTOs = group.getMembers().stream()
                .map(this::convertToMemberDTO)
                .collect(Collectors.toList());
//        dto.setMembers(memberDTOs);
        dto.setCurrentParticipants(memberDTOs.size());

        // 👉 Lấy role của member đang gọi API
        GroupMember matchedMember = group.getMembers().stream()
                .filter(m -> m.getMember().getId().equals(currentMemberId))
                .findFirst()
                .orElse(null);

        if (matchedMember != null) {
            dto.setCurrentMemberRole(matchedMember.getRole());
        }

        return dto;
    }

    private GroupResponse convertToGroupDetail(Groups group, Long currentMemberId) {
        GroupResponse dto = new GroupResponse();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setMaxParticipants(group.getMaxParticipants());
        dto.setPicture(group.getPicture());
        dto.setCreatedAt(group.getCreatedAt());
        dto.setCreatedBy(group.getCreatedBy());
        dto.setUpdatedAt(group.getUpdatedAt());
        dto.setUpdatedBy(group.getUpdatedBy());

        // Member list
        List<GroupMemberResponse> memberDTOs = group.getMembers().stream()
                .map(this::convertToMemberDTO)
                .collect(Collectors.toList());
        dto.setMembers(memberDTOs);

        // 👉 Lấy role của member đang gọi API
        GroupMember matchedMember = group.getMembers().stream()
                .filter(m -> m.getMember().getId().equals(currentMemberId))
                .findFirst()
                .orElse(null);

        if (matchedMember != null) {
            dto.setCurrentMemberRole(matchedMember.getRole());
        }
        return dto;
    }


    private GroupMemberResponse convertToMemberDTO(GroupMember groupMember) {
        GroupMemberResponse dto = new GroupMemberResponse();
        dto.setId(groupMember.getId());
        dto.setMemberId(groupMember.getMember().getId()); // Return only Member ID
        Optional<Member> member = memberRepository.findById(dto.getMemberId());
        dto.setImageUrl(member.map(Member::getAvatar).orElse("https://example.com/default-avatar.png"));
        dto.setMemberName(member.map(Member::getFullName).orElse("User name not found"));
        dto.setJoinDate(groupMember.getMember().getCreatedAt());
        dto.setRole(groupMember.getRole());
        dto.setStatus(groupMember.getStatus());
        return dto;
    }


    @Override
    @Transactional
    public Groups createGroup(GroupRequest request, MultipartFile picture, String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        Long AccountId = account.getId();

        String pictureUrl = null;
        try {
            if (picture != null && !picture.isEmpty()) {
                pictureUrl = firebaseUpload.uploadFile(picture);
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error uploading files: " + e.getMessage());
        }

        // 🔥 Step 1: Create the Group
        Groups group = Groups.builder()
                .name(request.getName())
                .maxParticipants(request.getMaxParticipants())
                .createdBy(AccountId)
                .picture(pictureUrl)
                .build();

        Groups savedGroup = groupRepository.save(group); // Save group first

        // 🔥 Step 2: Find the Member who is creating the group
        Member member = memberRepository.findById(AccountId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        // 🔥 Step 3: Add the creator as a member in GroupMember table
        GroupMember groupMember = GroupMember.builder()
                .group(savedGroup)
                .member(member)
                .role("OWNER") // You can change role as needed
                .status(GroupMemberStatus.ACTIVE) // Default status
                .createdBy(AccountId)
                .build();

        groupMemberRepository.save(groupMember); // Save GroupMember entry

        return savedGroup;
    }


    @Override
    public Groups updateGroup(Long groupId, GroupRequest request, Long updatedBy) {
        Groups group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        group.setName(request.getName());
        group.setMaxParticipants(request.getMaxParticipants());
        group.setUpdatedBy(updatedBy);

        return groupRepository.save(group);
    }

    @Override
    public void kickMember(Long groupId, Long memberId, String username) {
        // 🔥 Lấy Group cần kick thành viên
        Groups group = groupRepository.findById(groupId).orElse(null);

        if (group == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found");
        }

        // 🔥 Lấy tài khoản yêu cầu kick (phải là owner của group)
        Account requesterAccount = accountRepository.findByUsername(username).orElse(null);

        if (requesterAccount == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found");
        }

        if (!group.getCreatedBy().equals(requesterAccount.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to kick members from this group");
        }

        // 🔥 Lấy ra thành viên cần kick
        Optional<GroupMember> optionalMember = groupMemberRepository.findByGroupIdAndMemberIdAndStatus(groupId, memberId, GroupMemberStatus.ACTIVE);

        if (optionalMember.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found in this group");
        }

        GroupMember memberToKick = optionalMember.get();
        memberToKick.setStatus(GroupMemberStatus.LEFT);
        groupMemberRepository.save(memberToKick);
    }

    @Override
    public void leaveGroup(Long groupId, String username) {
        // 🔥 Lấy tài khoản hiện tại
        Account account = accountRepository.findByUsername(username).orElse(null);

        if (account == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found");
        }

        // 🔥 Tìm thành viên tương ứng với tài khoản
        Member member = memberRepository.findByAccount(account).orElse(null);

        if (member == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found");
        }

        // 🔥 Lấy ra mối quan hệ thành viên và nhóm
        Optional<GroupMember> optionalGroupMember = groupMemberRepository.findByGroupIdAndMemberIdAndStatus(groupId, member.getId(), GroupMemberStatus.ACTIVE);

        if (optionalGroupMember.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "You are not a member of this group");
        }

        GroupMember groupMember = optionalGroupMember.get();
        groupMember.setStatus(GroupMemberStatus.LEFT);
        groupMemberRepository.save(groupMember);
    }



    public void inviteMembers(GroupInviteRequest request) {
        // Lấy thông tin nhóm
        Groups group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nhóm không tồn tại"));

        // Lấy danh sách thành viên từ ID
        List<Member> membersToInvite = memberRepository.findAllById(request.getMemberIds());

        if (membersToInvite.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không tìm thấy thành viên nào với ID đã cung cấp");
        }

        List<GroupMember> invitations = new ArrayList<>();
        for (Member member : membersToInvite) {
            // Kiểm tra xem thành viên đã ở trong nhóm chưa
            boolean alreadyMember = groupMemberRepository.existsByGroupAndMember(group, member);
            if (alreadyMember) {
                continue;
            }

            GroupMember invitation = GroupMember.builder()
                    .group(group)
                    .member(member)
                    .role("MEMBER") // Mặc định là MEMBER khi được mời
                    .status(GroupMemberStatus.PENDING) // Đánh dấu trạng thái là PENDING
                    .createdBy(group.getCreatedBy()) // Người gửi lời mời
                    .build();
            invitations.add(invitation);
        }

        if (!invitations.isEmpty()) {
            groupMemberRepository.saveAll(invitations);
        }
    }

    /**
     * Thành viên phản hồi lời mời (Chấp nhận hoặc từ chối)
     */
    public void respondToInvitation(Long groupId, String username, GroupMemberStatus status) {
        Account account = accountRepository.findByUsername(username).orElse(null);

        if (account == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found");
        }

        Member member = memberRepository.findByAccount(account).orElse(null);
        Groups group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nhóm không tồn tại"));

        GroupMember groupMember = groupMemberRepository.findByGroupAndMember(group, member)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lời mời không tồn tại"));

        // Cập nhật trạng thái lời mời
        if(status == GroupMemberStatus.ACCEPTED) {
            status = GroupMemberStatus.ACTIVE;
        }
        groupMember.setStatus(status);
        groupMemberRepository.save(groupMember);
    }

    public List<GroupInvitationDTO> getPendingInvitations(String username) {
        Account account = accountRepository.findByUsername(username).orElse(null);

        if (account == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found");
        }

        // 🔥 Tìm thành viên tương ứng với tài khoản
        Member member = memberRepository.findByAccount(account).orElse(null);
        List<GroupMember> invitations = groupMemberRepository.findByMemberAndStatus(member, GroupMemberStatus.PENDING);

        return invitations.stream().map(invite -> {
            GroupInvitationDTO dto = new GroupInvitationDTO();
            dto.setGroupId(invite.getGroup().getId());
            dto.setImg(invite.getGroup().getPicture());
            dto.setName(invite.getMember().getFullName());
            dto.setGroupName(invite.getGroup().getName());
            dto.setInvitedBy(invite.getCreatedBy().toString()); // Chuyển đổi ID sang String
            return dto;
        }).collect(Collectors.toList());
    }
    public List<MemberSearchResponse> searchMembers(MemberSearchRequest request, String username) {
        Pageable pageable = PageRequest.of(0, 5); // Giới hạn 5 kết quả

        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        Member currentMember = memberRepository.findByAccount(account)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        Long currentMemberId = currentMember.getId();

        List<Member> members = memberRepository.searchByEmailOrFullName(request.getKeyword(), pageable);

        // Lọc bỏ người đang đăng nhập
        members.removeIf(member -> member.getId().equals(currentMemberId));

        if (request.getGroupId() != null) {
            Groups group = groupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nhóm không tồn tại"));

            Set<Long> groupMemberIds = new HashSet<>(groupMemberRepository.findMemberIdsByGroup(group));

            // Lọc bỏ người đã trong nhóm
            members.removeIf(member -> groupMemberIds.contains(member.getId()));
        }

        // Chỉ lấy tối đa 5 kết quả
        return members.stream()
                .limit(5)
                .map(m -> new MemberSearchResponse(m.getId(), m.getAccount().getEmail(), m.getAvatar(), m.getFullName()))
                .toList();
    }

}
