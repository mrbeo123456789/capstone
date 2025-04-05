package org.capstone.backend.service.member;

import org.capstone.backend.dto.member.ChangePasswordRequest;
import org.capstone.backend.dto.member.UserProfileRequest;
import org.capstone.backend.dto.member.UserProfileResponse;
import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.Member;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.InvitePermission;
import org.capstone.backend.utils.upload.FirebaseUpload;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
public class MemberServiceImpl implements MemberService {
    private final MemberRepository memberRepository;
    private final AccountRepository accountRepository;
    private final FirebaseUpload firebaseUpload;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    public MemberServiceImpl(
            MemberRepository memberRepository,
            AccountRepository accountRepository,
            FirebaseUpload firebaseUpload,
            PasswordEncoder passwordEncoder,
            AuthService authService
    ) {
        this.memberRepository = memberRepository;
        this.accountRepository = accountRepository;
        this.firebaseUpload = firebaseUpload;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
    }

    @Override
    public UserProfileResponse getMemberProfile() {
        Member member = findOrCreateMember();
        return mapToDto(member);
    }

    @Override
    public UserProfileResponse updateMember(UserProfileRequest request, MultipartFile avatar) throws IOException {
        Member member = findOrCreateMember();

        // Upload avatar lên Firebase nếu có file mới
        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = firebaseUpload.uploadFile(avatar, "avatar");
            member.setAvatar(avatarUrl);
        }

        // Cập nhật thông tin profile từ DTO
        member.setFirstName(request.getFirstName());
        member.setFullName(request.getFullName());
        member.setLastName(request.getLastName());
        member.setGender(request.getGender());
        member.setPhone(request.getPhone());
        member.setAddress(request.getAddress());
        member.setProvince(request.getProvince());
        member.setWard(request.getWard());
        member.setDistrict(request.getDistrict());
        member.setDateOfBirth(request.getDateOfBirth());
        member.setInvitePermission(request.getInvitePermission());


        // Lưu lại thông tin member đã cập nhật
        Member updatedMember = memberRepository.save(member);
        return mapToDto(updatedMember);
    }

    private Member findOrCreateMember() {
        Long memberId = authService.getMemberIdFromAuthentication();
        if (memberId != null) {
            return memberRepository.findById(memberId)
                    .orElseThrow(() -> new RuntimeException("Member not found with ID: " + memberId));
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found with username: " + username));

        Member newMember = new Member();
        newMember.setAccount(account);
        newMember.setInvitePermission(InvitePermission.EVERYONE);
        newMember.setCreatedAt(LocalDateTime.now());
        newMember.setUpdatedAt(LocalDateTime.now());
        newMember.setUpdatedBy(username);

        return memberRepository.save(newMember);
    }

    private UserProfileResponse mapToDto(Member member) {
        UserProfileResponse response = new UserProfileResponse();
        response.setUsername(member.getAccount().getUsername());
        response.setEmail(member.getAccount().getEmail());
        response.setFullName(member.getFullName());
        response.setFirstName(member.getFirstName());
        response.setLastName(member.getLastName());
        response.setGender(member.getGender());
        response.setPhone(member.getPhone());
        response.setAvatar(member.getAvatar());
        response.setAddress(member.getAddress());
        response.setProvince(member.getProvince());
        response.setDistrict(member.getDistrict());
        response.setWard(member.getWard());
        response.setDateOfBirth(member.getDateOfBirth());
        response.setInvitePermission(member.getInvitePermission());
        return response;
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Account user = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!BCrypt.checkpw(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(user);
    }
}
