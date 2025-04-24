package org.capstone.backend.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChallengeDashboardDTO {
    private String name;
    private String category;
    private Long members;
    private Long reportCount;
    private String status;
}
