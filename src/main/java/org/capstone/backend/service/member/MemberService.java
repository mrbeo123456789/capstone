package org.capstone.backend.service.member;

import org.capstone.backend.dto.member.ChangePasswordRequest;
import org.capstone.backend.dto.member.UserProfileRequest;
import org.capstone.backend.dto.member.UserProfileResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface MemberService {
    UserProfileResponse getMemberProfile(String username);
    UserProfileResponse updateMember(String username, UserProfileRequest request, MultipartFile avatar) throws IOException;

    void changePassword(String username, ChangePasswordRequest request);
}
