package org.capstone.backend.controller.admin;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.entity.ChallengeType;
import org.capstone.backend.entity.Interest;
import org.capstone.backend.service.challenge.ChallengeTypeService;
import org.capstone.backend.service.interest.InterestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/setting")
public class SettingController {

    private ChallengeTypeService challengeTypeService;
  private InterestService interestService;
    // 📄 Lấy danh sách challenge types có phân trang + tìm kiếm theo keyword
    @GetMapping("/challenge-types")
    public Page<ChallengeType> getChallengeTypes(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return challengeTypeService.findAllPaged(keyword, page, size);
    }

    // ➕ Tạo mới challenge type
    @PostMapping("/challenge-types")
    public ChallengeType createChallengeType(@RequestBody ChallengeType challengeType) {
        return challengeTypeService.create(challengeType);
    }

    // ✏️ Cập nhật challenge type
    @PutMapping("/challenge-types/{id}")
    public ChallengeType updateChallengeType(@PathVariable Long id, @RequestBody ChallengeType updated) {
        return challengeTypeService.update(id, updated);
    }

    // ❌ Xoá challenge type
    @DeleteMapping("/challenge-types/{id}")
    public void deleteChallengeType(@PathVariable Long id) {
        challengeTypeService.delete(id);
    }

    // --- INTEREST CRUD ---

    @GetMapping("/interests")
    public Page<Interest> getInterests(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return interestService.findAllPaged(keyword, page, size);
    }

    @PostMapping("/interests")
    public Interest createInterest(@RequestBody Interest interest) {
        return interestService.create(interest);
    }

    @PutMapping("/interests/{id}")
    public Interest updateInterest(@PathVariable Long id, @RequestBody Interest updated) {
        return interestService.update(id, updated);
    }

    @DeleteMapping("/interests/{id}")
    public void deleteInterest(@PathVariable Long id) {
        interestService.delete(id);
    }
}
