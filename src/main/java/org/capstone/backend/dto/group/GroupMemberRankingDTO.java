package org.capstone.backend.dto.group;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GroupMemberRankingDTO {
    private Long memberId;
    private String name;
    private String avatar;
    private Long totalStars;
    private LocalDateTime joinDate;
}
