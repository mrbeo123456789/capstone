package org.capstone.backend.controller.challenge;

import org.capstone.backend.dto.challenge.ChallengeRequest;
import org.capstone.backend.entity.Challenge;

import org.capstone.backend.entity.ChallengeType;
import org.capstone.backend.service.challenge.ChallengeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {

    @Autowired
    private ChallengeService challengeService;

    @PostMapping("/create")
    public ResponseEntity<Challenge> createChallenge(@RequestBody ChallengeRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("User is not authenticated");
        }

        String username = authentication.getName();
        Challenge createdChallenge = challengeService.createChallenge(request, username);
        return ResponseEntity.ok(createdChallenge);
    }
    @GetMapping("/challenge-types")
    public List<ChallengeType> getAllChallengeTypes() {
        return challengeService.getAllTypes();
    }

}
