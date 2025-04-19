package org.capstone.backend.controller.member;

import org.capstone.backend.dto.member.ChangePasswordRequest;
import org.capstone.backend.dto.member.UserProfileRequest;
import org.capstone.backend.dto.member.UserProfileResponse;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.service.member.MemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/member")
public class MemberController {

    private final MemberService memberService;
 private  final AuthService authService;
    public MemberController(MemberService memberService, AuthService authService) {
        this.memberService = memberService;
        this.authService = authService;
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
    @GetMapping("/me")
    public ResponseEntity<Map<String, Long>> getCurrentMemberId() {
        Long memberId = authService.getMemberIdFromAuthentication();


        Map<String, Long> response = new HashMap<>();
        response.put("memberId", memberId);
        return ResponseEntity.ok(response);
    }
}
