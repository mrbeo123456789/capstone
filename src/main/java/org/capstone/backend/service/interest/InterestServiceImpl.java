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
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private final AuthService authService;
    /**
     * Lấy danh sách Interests của Member đang đăng nhập
     */
    @Override
    @Transactional(readOnly = true)
    public Map<String, List<InterestDTO>> getInterestsForAuthenticatedMember() {
        Member member = memberRepository.getReferenceById(authService.getMemberIdFromAuthentication());

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
        Member member = memberRepository.getReferenceById(authService.getMemberIdFromAuthentication());

        // Lấy danh sách Interests từ ID gửi lên
        Set<Interest> newInterests = new HashSet<>(interestRepository.findAllById(interestIds));

        // Cập nhật Interests đúng cách để tránh ConcurrentModificationException
        member.setInterests(newInterests);

        memberRepository.save(member);
    }



    // 🔍 Phân trang + tìm kiếm
    public Page<Interest> findAllPaged(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (keyword == null || keyword.isBlank()) {
            return interestRepository.findAll(pageable);
        } else {
            return interestRepository.findByNameContainingIgnoreCase(keyword, pageable);
        }
    }

    // ➕ Tạo mới
    public Interest create(Interest interest) {
        return interestRepository.save(interest);
    }

    // ✏️ Cập nhật
    public Interest update(Long id, Interest updated) {
        return interestRepository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            return interestRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Interest not found"));
    }

    // ❌ Xoá
    public void delete(Long id) {
        Interest interest = interestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interest not found"));

        // Gỡ liên kết với member trước khi xoá
        interest.getMembers().forEach(member -> {
            member.getInterests().remove(interest);
        });

        interestRepository.delete(interest);
    }


}
