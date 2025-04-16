package org.capstone.backend.service.member;

import org.capstone.backend.dto.member.ChangePasswordRequest;
import org.capstone.backend.dto.member.UserProfileRequest;
import org.capstone.backend.dto.member.UserProfileResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface MemberService {
    UserProfileResponse getMemberProfile();
    UserProfileResponse updateMember (UserProfileRequest request, MultipartFile avatar) ;

    void changePassword( ChangePasswordRequest request);
}
