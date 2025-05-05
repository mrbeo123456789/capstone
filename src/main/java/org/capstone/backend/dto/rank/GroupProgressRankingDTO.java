package org.capstone.backend.dto.rank;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupProgressRankingDTO {
    private Long challengeId;
    private Long groupId;
    private String groupName;
    private String groupPicture; // ✅ ảnh nhóm
    private Double averageScore;
    private Integer memberCount;
}
