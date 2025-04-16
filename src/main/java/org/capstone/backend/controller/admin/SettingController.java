package org.capstone.backend.controller.admin;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.interest.InterestDTO;
import org.capstone.backend.entity.ChallengeType;
import org.capstone.backend.entity.Interest;
import org.capstone.backend.service.challenge.ChallengeTypeService;
import org.capstone.backend.service.interest.InterestService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/setting")
public class SettingController {

    private final ChallengeTypeService challengeTypeService;
    private final InterestService interestService;

    // --- CHALLENGE TYPE CRUD ---

    @GetMapping("/challenge-types")
    public ResponseEntity<Page<ChallengeType>> getChallengeTypes(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ChallengeType> result = challengeTypeService.findAllPaged(keyword, page, size);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/challenge-types")
    public ResponseEntity<ChallengeType> createChallengeType(@RequestBody ChallengeType challengeType) {
        ChallengeType created = challengeTypeService.create(challengeType);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/challenge-types/{id}")
    public ResponseEntity<ChallengeType> updateChallengeType(@PathVariable Long id, @RequestBody ChallengeType updated) {
        ChallengeType result = challengeTypeService.update(id, updated);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/challenge-types/{id}")
    public ResponseEntity<String> deleteChallengeType(@PathVariable Long id) {
        challengeTypeService.delete(id);
        return ResponseEntity.ok("ChallengeType deleted successfully.");
    }

    // --- INTEREST CRUD ---

    @GetMapping("/interests")
    public ResponseEntity<Page<Interest>> getInterests(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<Interest> result = interestService.findAllPaged(keyword, page, size);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/interests")
    public ResponseEntity<Interest> createInterest(@RequestBody Interest interest) {
        Interest created = interestService.create(interest);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/interests/{id}")
    public ResponseEntity<Interest> updateInterest(@PathVariable Long id, @RequestBody Interest updated) {
        Interest result = interestService.update(id, updated);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/interests/{id}/status")
    public ResponseEntity<String> updateInterestStatus(@PathVariable Long id, @RequestParam boolean active) {
        interestService.toggleActive(id, active);
        String status = active ? "activated" : "deactivated";
        return ResponseEntity.ok("Interest " + status + " successfully.");
    }

    @DeleteMapping("/interests/{id}")
    public ResponseEntity<String> deleteInterest(@PathVariable Long id) {
        interestService.delete(id);
        return ResponseEntity.ok("Interest deleted successfully.");
    }
}
