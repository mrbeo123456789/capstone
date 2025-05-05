package org.capstone.backend.dto.challenge;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminDashboardSummaryDTO {
    private Long totalCreated;       // Số thử thách do admin tạo
    private Long activeChallenges;   // Số thử thách ACTIVE của admin
    private Long totalParticipants;  // Tổng member tham gia challenge của admin
}
