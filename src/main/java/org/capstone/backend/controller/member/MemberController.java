package org.capstone.backend.controller.member;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.capstone.backend.dto.member.ChangePasswordRequest;
import org.capstone.backend.dto.member.UserProfileRequest;
import org.capstone.backend.dto.member.UserProfileResponse;
import org.capstone.backend.service.member.MemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    public ResponseEntity<?> updateProfile(
            @Validated @ModelAttribute("data") UserProfileRequest request,  // 🔥 Automatically binds JSON fields
            @RequestParam(value = "avatar", required = false) MultipartFile avatar  // 🔥 Handles file upload
    ) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || "anonymousUser".equals(authentication.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User is not authenticated");
            }
            String username = authentication.getName();
            UserProfileResponse updatedProfile = memberService.updateMember( request, avatar);

            return ResponseEntity.ok(updatedProfile);
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid JSON format: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating profile: " + e.getMessage());
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            memberService.changePassword( request);
            return ResponseEntity.ok("Password changed successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}
