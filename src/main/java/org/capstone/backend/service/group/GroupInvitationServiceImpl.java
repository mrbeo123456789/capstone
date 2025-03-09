package org.capstone.backend.service.group;

import org.capstone.backend.entity.*;
import org.capstone.backend.repository.*;
import org.capstone.backend.utils.enums.GroupMemberStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class GroupInvitationServiceImpl implements GroupInvitationService {

    private final GroupInvitationRepository groupInvitationRepository;
    private final GroupRepository groupsRepository;
    private final MemberRepository memberRepository;
    private final GroupMemberRepository groupMemberRepository;
   private final AccountRepository accountRepository;

    public GroupInvitationServiceImpl(GroupInvitationRepository groupInvitationRepository, GroupRepository groupsRepository, MemberRepository memberRepository, GroupMemberRepository groupMemberRepository, AccountRepository accountRepository) {
        this.groupInvitationRepository = groupInvitationRepository;
        this.groupsRepository = groupsRepository;
        this.memberRepository = memberRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    public GroupInvitation createInvitation(Long groupId, List<String> emails) {
        Optional<GroupInvitation> existingInvitation = groupInvitationRepository.findByGroupIdAndExpiresAtAfter(groupId, LocalDateTime.now());

        if (existingInvitation.isPresent()) {
            return existingInvitation.get();
        }

        Groups group = groupsRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        GroupInvitation invitation = GroupInvitation.builder()
                .group(group)
                .inviteLink(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plusDays(2))
                .allowedEmails(emails)
                .build();

        return groupInvitationRepository.save(invitation);
    }

    @Override
    public GroupInvitation updateInvitation(Long groupId, List<String> emails) {
        Optional<GroupInvitation> existingInvitation = groupInvitationRepository
                .findByGroupIdAndExpiresAtAfter(groupId, LocalDateTime.now());

        if (existingInvitation.isPresent()) {
            // Nếu tìm thấy lời mời còn hạn, thì cập nhật danh sách email
            GroupInvitation invitation = existingInvitation.get();
            invitation.setAllowedEmails(emails);
            return groupInvitationRepository.save(invitation);
        } else {
            // Nếu không tìm thấy lời mời còn hạn, thì tạo mới lời mời
            Groups group = groupsRepository.findById(groupId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

            GroupInvitation newInvitation = GroupInvitation.builder()
                    .group(group)
                    .inviteLink(UUID.randomUUID().toString()) // Tạo link ngẫu nhiên mới
                    .allowedEmails(emails)
                    .createdAt(LocalDateTime.now())
                    .expiresAt(LocalDateTime.now().plusDays(2)) // Hết hạn sau 2 ngày
                    .build();

            return groupInvitationRepository.save(newInvitation);
        }
    }


    @Override
    public String acceptInvitation(String inviteCode, String username) {
        // Tìm account theo username
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        String email = account.getEmail();
        if (email == null || email.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email not associated with this account");
        }

        // Kiểm tra và lấy lời mời từ DB
        GroupInvitation invitation = groupInvitationRepository.findByInviteLink(inviteCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid invite code"));

        // Kiểm tra xem email có hợp lệ không
        if (!invitation.isValid(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to join this group");
        }

        // Lấy thông tin member từ email
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        // Kiểm tra xem đã tham gia nhóm chưa
        boolean alreadyJoined = groupMemberRepository.existsByGroupAndMember(invitation.getGroup(), member);
        if (alreadyJoined) {
            return "https://yourapp.com/groups/" + invitation.getGroup().getId();
        }

        // Thêm member vào group
        GroupMember groupMember = GroupMember.builder()
                .group(invitation.getGroup())
                .member(member)
                .role("MEMBER")
                .status(GroupMemberStatus.ACTIVE)
                .createdBy(account.getId()) // Lưu ID người dùng tạo record này
                .build();

        groupMemberRepository.save(groupMember);

        return "https://yourapp.com/groups/" + invitation.getGroup().getId();
    }

}
