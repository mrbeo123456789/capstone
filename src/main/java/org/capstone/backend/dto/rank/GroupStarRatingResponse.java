package org.capstone.backend.dto.rank;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GroupStarRatingResponse {
    private Long groupId;
    private String groupName;
    private String picture;
    private Double averageStar;
    private Integer memberCount;
}
