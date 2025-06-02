package org.capstone.backend.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor // ✅ adds constructor with all fields
@NoArgsConstructor  // ✅ required if Spring needs to instantiate via reflection
public class ChallengeSummaryDTO {
    private Long id;
    private String name;
    private String banner;
    private String picture;
    private String role;
    private Double rating;
}