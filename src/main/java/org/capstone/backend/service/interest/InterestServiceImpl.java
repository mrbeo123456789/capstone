package org.capstone.backend.service.interest;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.interest.InterestDTO;
import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.ChallengeMember;
import org.capstone.backend.entity.Interest;
import org.capstone.backend.entity.Member;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.repository.InterestRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.utils.enums.Role;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterestServiceImpl implements InterestService {
    private final InterestRepository interestRepository;
    private final AccountRepository accountRepository;
    private final MemberRepository memberRepository;

    /**
     * Lấy danh sách Interests của Member đang đăng nhập
     */
    @Override
    @Transactional(readOnly = true)
    public Map<String, List<InterestDTO>> getInterestsForAuthenticatedMember() {
        Member member = getAuthenticatedMember();

        // Tạo một Set để tránh ConcurrentModificationException
        Set<Interest> memberInterestsSet = new HashSet<>(member.getInterests());

        // Chuyển đổi sang DTO
        List<InterestDTO> memberInterests = memberInterestsSet.stream()
                .map(interest -> new InterestDTO(interest.getId(), interest.getName()))
                .collect(Collectors.toList());

        // Lấy danh sách Interests chưa sở hữu
        List<InterestDTO> otherInterests = interestRepository.findAll().stream()
                .filter(interest -> !memberInterestsSet.contains(interest))
                .map(interest -> new InterestDTO(interest.getId(), interest.getName()))
                .collect(Collectors.toList());

        Map<String, List<InterestDTO>> response = new HashMap<>();
        response.put("owned", memberInterests);
        response.put("notOwned", otherInterests);

        return response;
    }

    /**
     * Cập nhật Interests cho Member (thêm mới & xóa những cái không còn nữa)
     */
    @Override
    @Transactional
    public void updateMemberInterests(List<Long> interestIds) {
        Member member = getAuthenticatedMember();
        if (member == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin không thể cập nhật Interests");
        }

        // Lấy danh sách Interests từ ID gửi lên
        Set<Interest> newInterests = new HashSet<>(interestRepository.findAllById(interestIds));

        // Cập nhật Interests đúng cách để tránh ConcurrentModificationException
        member.setInterests(newInterests);

        memberRepository.save(member);
    }

    /**
     * Lấy thông tin Member từ tài khoản đang đăng nhập
     */
    private Member getAuthenticatedMember() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        String username = authentication.getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        return memberRepository.findByAccount(account)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));
    }
}
