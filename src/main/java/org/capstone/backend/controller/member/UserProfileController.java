package org.capstone.backend.controller.member;

import jakarta.validation.Valid;
import org.capstone.backend.dto.member.UserProfileRequest;
import org.capstone.backend.dto.member.UserProfileResponse;
import org.capstone.backend.entity.Member;
import org.capstone.backend.service.UserProfileService;
import org.capstone.backend.utils.upload.FirebaseUpload;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/member")
public class UserProfileController {
    private final UserProfileService userProfileService;
    private final FirebaseUpload firebaseUpload;;

    public UserProfileController(UserProfileService userProfileService, FirebaseUpload firebaseUpload) {
        this.userProfileService = userProfileService;
        this.firebaseUpload = firebaseUpload;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("User is not authenticated");
        }

        String username = authentication.getName(); //
        UserProfileResponse profile = userProfileService.getMemberProfile(username);
        return ResponseEntity.ok(profile);
    }

    @PutMapping(value = "/update", consumes = {"multipart/form-data"})
    public ResponseEntity<Member> updateProfile(
            @RequestPart("data") @Valid UserProfileRequest request, // 🎯 Lấy JSON từ multipart
            @RequestPart(value = "avatar", required = false) MultipartFile avatar // 🎯 File ảnh (có thể null)
    ) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("User is not authenticated");
        }

        String username = authentication.getName();
        Member updatedMember = userProfileService.updateMember(username, request, avatar);
        return ResponseEntity.ok(updatedMember);
    }

}