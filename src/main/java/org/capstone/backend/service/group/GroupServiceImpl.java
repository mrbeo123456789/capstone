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
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
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
                .status("ACTIVE") // Default status
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
}
