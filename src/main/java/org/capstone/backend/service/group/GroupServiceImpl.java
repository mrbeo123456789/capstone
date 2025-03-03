package org.capstone.backend.service.group.impl;

import org.capstone.backend.entity.Groups;
import org.capstone.backend.entity.Member;
import org.capstone.backend.dto.group.GroupRequest;
import org.capstone.backend.repository.GroupRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.service.group.GroupService;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final MemberRepository memberRepository;

    public GroupServiceImpl(GroupRepository groupRepository, MemberRepository memberRepository) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
    }

    @Override
    public List<Groups> getGroupsByMemberId(Long memberId) {
        return groupRepository.findByMemberId(memberId);
    }

    @Override
    public Groups createGroup(GroupRequest request, Long createdBy) {
        Groups group = Groups.builder()
                .name(request.getName())
                .maxParticipants(request.getMaxParticipants())
                .createdBy(createdBy)
                .build();
        return groupRepository.save(group);
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
    public Long getMemberIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("User is not authenticated");
        }

//        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
//        Member member = memberRepository.findByAccountId(userDetails.getId());
//
//        if (member == null) {
//            throw new RuntimeException("Member not found");
//        }
//
//        return member.getId();
        return null;
    }
}
