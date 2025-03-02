package org.capstone.backend.service;

import org.capstone.backend.dto.member.UserProfileRequest;
import org.capstone.backend.dto.member.UserProfileResponse;
import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.Member;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.utils.upload.FirebaseUpload;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
public class UserProfileService {
    private final MemberRepository memberRepository;
    private final AccountRepository accountRepository;
    private final FirebaseUpload firebaseUpload;

    public UserProfileService(MemberRepository memberRepository, AccountRepository accountRepository, FirebaseUpload firebaseUpload) {
        this.memberRepository = memberRepository;
        this.accountRepository = accountRepository;
        this.firebaseUpload = firebaseUpload;
    }

    // 🔹 Lấy thông tin profile (DTO)
    public UserProfileResponse getMemberProfile(String username) {
        Member member = findOrCreateMember(username);
        return mapToDto(member);
    }

    // 🔹 Cập nhật profile (hoặc tạo mới nếu chưa có)
    public Member updateMember(String username, UserProfileRequest request, MultipartFile avatar) throws IOException {
        Member member = findOrCreateMember(username);

        // ✅ Upload avatar lên Firebase nếu có file mới
        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = firebaseUpload.uploadFile(avatar);
            member.setAvatar(avatarUrl);
        }

        // ✅ Cập nhật thông tin từ DTO
        member.setFirstName(request.getFirstName());
        member.setLastName(request.getLastName());
        member.setAge(request.getAge());
        member.setGender(request.getGender());
        member.setPhone(request.getPhone());
        member.setAddress(request.getAddress());
        member.setCountry(request.getCountry());
        member.setDateOfBirth(request.getDateOfBirth());
        member.setUpdatedAt(LocalDateTime.now());
        member.setUpdatedBy(username);


        return memberRepository.save(member);
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
            return memberRepository.save(newMember); // ⚡ Tạo mới ngay lập tức để tránh lỗi tham chiếu
        });
    }

    private UserProfileResponse mapToDto(Member member) {
        UserProfileResponse response = new UserProfileResponse();
        response.setFirstName(member.getFirstName());
        response.setLastName(member.getLastName());
        response.setAge(member.getAge());
        response.setGender(member.getGender());
        response.setPhone(member.getPhone());
        response.setAvatar(member.getAvatar());
        response.setAddress(member.getAddress());
        response.setCountry(member.getCountry());
        response.setDateOfBirth(member.getDateOfBirth());
        return response;
    }
}
