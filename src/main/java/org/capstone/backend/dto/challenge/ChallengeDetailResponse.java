package org.capstone.backend.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChallengeDetailResponse {
    private Long id;
    private String name;
    private String description;
    private String summary;
    private LocalDate startDate;
    private LocalDate endDate;
    private String picture;
    private String challengeType;
    private boolean joined;
    private long participantCount;
    private long duration; // Thêm trường duration
}
