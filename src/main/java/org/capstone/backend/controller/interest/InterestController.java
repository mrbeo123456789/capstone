package org.capstone.backend.controller.interest;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.interest.InterestDTO;
import org.capstone.backend.dto.interest.MemberInterestDTO;
import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.Member;
import org.capstone.backend.service.interest.InterestService;
import org.capstone.backend.utils.enums.Role;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/member/interests")
@RequiredArgsConstructor
public class InterestController {
    private final InterestService interestService;

    /**
     * Lấy danh sách Interests của Member đang đăng nhập
     */
    @GetMapping("/get")
    public Map<String, List<InterestDTO>> getInterestsForAuthenticatedMember() {
        return interestService.getInterestsForAuthenticatedMember();
    }

    /**
     * Cập nhật Interests cho Member (gồm thêm mới & xóa những cái không còn nữa)
     */
    @PostMapping("/update")
    public ResponseEntity<String> updateMemberInterests(@RequestBody MemberInterestDTO request) {
        interestService.updateMemberInterests(request.getInterestIds());
        return ResponseEntity.ok("Interests updated successfully");
    }
}
