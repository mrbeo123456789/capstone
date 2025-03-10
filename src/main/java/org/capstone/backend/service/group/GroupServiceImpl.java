package org.capstone.backend.service.group;

import org.capstone.backend.dto.group.GroupMemberResponse;
import org.capstone.backend.dto.group.GroupResponse;
import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.GroupMember;
import org.capstone.backend.entity.Groups;
import org.capstone.backend.entity.Member;
import org.capstone.backend.dto.group.GroupRequest;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.repository.GroupMemberRepository;
import org.capstone.backend.repository.GroupRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.service.group.GroupService;
import org.capstone.backend.utils.enums.GroupMemberStatus;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final MemberRepository memberRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final AccountRepository accountRepository;

    public GroupServiceImpl(GroupRepository groupRepository,
                            MemberRepository memberRepository,
                            GroupMemberRepository groupMemberRepository,
                            AccountRepository accountRepository) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    public List<GroupResponse> getGroupsByMemberId(Long memberId) {
        List<Groups> groups = groupRepository.findByMemberId(memberId);

        return groups.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private GroupResponse convertToDTO(Groups group) {
        GroupResponse dto = new GroupResponse();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setMaxParticipants(group.getMaxParticipants());
        dto.setCreatedAt(group.getCreatedAt());
        dto.setCreatedBy(group.getCreatedBy());
        dto.setUpdatedAt(group.getUpdatedAt());
        dto.setUpdatedBy(group.getUpdatedBy());

        // Convert GroupMembers to DTOs
        List<GroupMemberResponse> memberDTOs = group.getMembers().stream()
                .map(this::convertToMemberDTO)
                .collect(Collectors.toList());

        dto.setMembers(memberDTOs);
        return dto;
    }

    private GroupMemberResponse convertToMemberDTO(GroupMember groupMember) {
        GroupMemberResponse dto = new GroupMemberResponse();
        dto.setId(groupMember.getId());
        dto.setMemberId(groupMember.getMember().getId()); // Return only Member ID
        dto.setRole(groupMember.getRole());
        dto.setStatus(groupMember.getStatus());
        return dto;
    }


    @Override
    public Groups createGroup(GroupRequest request, Long createdBy) {
        // 🔥 Step 1: Create the Group
        Groups group = Groups.builder()
                .name(request.getName())
                .maxParticipants(request.getMaxParticipants())
                .createdBy(createdBy)
                .build();

        Groups savedGroup = groupRepository.save(group); // Save group first

        // 🔥 Step 2: Find the Member who is creating the group
        Member member = memberRepository.findById(createdBy)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        // 🔥 Step 3: Add the creator as a member in GroupMember table
        GroupMember groupMember = GroupMember.builder()
                .group(savedGroup)
                .member(member)
                .role("OWNER") // You can change role as needed
                .status(GroupMemberStatus.ACTIVE) // Default status
                .createdBy(createdBy)
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





}
