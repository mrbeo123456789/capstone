package org.capstone.backend.service.member;

import org.capstone.backend.dto.member.ChangePasswordRequest;
import org.capstone.backend.dto.member.UserProfileRequest;
import org.capstone.backend.dto.member.UserProfileResponse;
import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.Member;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.utils.upload.FirebaseUpload;
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
    public MemberServiceImpl(MemberRepository memberRepository, AccountRepository accountRepository, FirebaseUpload firebaseUpload, PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.accountRepository = accountRepository;
        this.firebaseUpload = firebaseUpload;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserProfileResponse getMemberProfile(String username) {
        Member member = findOrCreateMember(username);
        return mapToDto(member);
    }

    @Override
    public UserProfileResponse updateMember(String username, UserProfileRequest request, MultipartFile avatar) throws IOException {
        Member member = findOrCreateMember(username);

        // Upload avatar lên Firebase nếu có file mới
        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = firebaseUpload.uploadFile(avatar);
            member.setAvatar(avatarUrl);
        }

        // Cập nhật thông tin profile từ DTO
        member.setFirstName(request.getFirstName());
        member.setLastName(request.getLastName());;
        member.setGender(request.getGender());
        member.setPhone(request.getPhone());
        member.setAddress(request.getAddress());
        member.setCity(request.getCity());
        member.setWard(request.getWard());
        member.setDistrict(request.getDistrict());
        member.setDateOfBirth(request.getDateOfBirth());
        member.setUpdatedAt(LocalDateTime.now());
        member.setUpdatedBy(username);

        // Lưu lại thông tin member đã cập nhật
        Member updatedMember = memberRepository.save(member);
        return mapToDto(updatedMember);
    }

    private Member findOrCreateMember(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found with username: " + username));

        return memberRepository.findByAccount(account).orElseGet(() -> {
            Member newMember = new Member();
            newMember.setAccount(account);
            newMember.setCreatedAt(LocalDateTime.now());
            newMember.setUpdatedAt(LocalDateTime.now());
            newMember.setUpdatedBy(username);
            return memberRepository.save(newMember); // Tạo mới ngay lập tức để tránh lỗi tham chiếu
        });
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
        response.setCity(member.getCity());
        response.setDistrict(member.getDistrict());
        response.setWard(member.getWard());
        response.setDateOfBirth(member.getDateOfBirth());
        return response;
    }
    @Override
    public void changePassword(String username, ChangePasswordRequest request) {
        Account user = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!BCrypt.checkpw(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }


        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(user);
    }

}
