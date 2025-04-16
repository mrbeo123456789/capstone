package org.capstone.backend.controller.member;

import org.capstone.backend.dto.member.ChangePasswordRequest;
import org.capstone.backend.dto.member.UserProfileRequest;
import org.capstone.backend.dto.member.UserProfileResponse;
import org.capstone.backend.service.member.MemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/member")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile() {
        UserProfileResponse profile = memberService.getMemberProfile();
        return ResponseEntity.ok(profile);
    }

    @PutMapping(value = "/update", consumes = {"multipart/form-data"})
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Validated @ModelAttribute("data") UserProfileRequest request,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar
    ) {
        UserProfileResponse updatedProfile = memberService.updateMember(request, avatar);
        return ResponseEntity.ok(updatedProfile);
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request) {
        memberService.changePassword(request);
        return ResponseEntity.ok("Password changed successfully!");
    }
}
