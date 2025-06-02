package org.capstone.backend.service.member;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.member.ChangePasswordRequest;
import org.capstone.backend.dto.member.MemberStatisticDTO;
import org.capstone.backend.dto.member.UserProfileRequest;
import org.capstone.backend.dto.member.UserProfileResponse;
import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.Member;
import org.capstone.backend.event.ProfileUpdatedEvent;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.InvitePermission;
import org.capstone.backend.utils.upload.FirebaseUpload;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
@RequiredArgsConstructor
@Service
public class MemberServiceImpl implements MemberService {
    private final ApplicationEventPublisher eventPublisher; // Dùng để đẩy notification event
    private final MemberRepository memberRepository;
    private final AccountRepository accountRepository;
    private final FirebaseUpload firebaseUpload;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;


    @Override
    public UserProfileResponse getMemberProfile() {
        Member member = findOrCreateMember();
        return mapToDto(member);
    }

    @Override
    public UserProfileResponse updateMember(UserProfileRequest request, MultipartFile avatar) {
        Member member = findOrCreateMember();

        if (avatar != null && !avatar.isEmpty()) {
            try {
                String avatarUrl = firebaseUpload.uploadFile(avatar, "avatar");
                member.setAvatar(avatarUrl);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tải lên avatar: " + e.getMessage());
            }
        }

//        member.setFirstName(request.getFirstName());
//        member.setLastName(request.getLastName());
        member.setFullName(request.getFullName());
        member.setGender(request.getGender());
        member.setPhone(request.getPhone());
        member.setAddress(request.getAddress());
        member.setProvince(request.getProvince());
        member.setWard(request.getWard());
        member.setDistrict(request.getDistrict());
        member.setDateOfBirth(request.getDateOfBirth());
        member.setInvitePermission(request.getInvitePermission());

        Member updatedMember = memberRepository.save(member);
        eventPublisher.publishEvent(new ProfileUpdatedEvent(updatedMember));

        return mapToDto(updatedMember);
    }

    private Member findOrCreateMember() {
        Long memberId = authService.getMemberIdFromAuthentication();
        if (memberId != null) {
            return memberRepository.findById(memberId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên với ID: " + memberId));
        }
        // Nếu chưa tồn tại member, lấy thông tin từ authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản với username: " + username));

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
//        response.setFirstName(member.getFirstName());
//        response.setLastName(member.getLastName());
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với username: " + username));

        if (!BCrypt.checkpw(request.getOldPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu cũ không chính xác.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(user);
    }

    @Override
    public MemberStatisticDTO getMemberStatistics() {
        Long memberId = authService.getMemberIdFromAuthentication();
        return memberRepository.getMemberStatistics(memberId);
    }

}
