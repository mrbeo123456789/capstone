package org.capstone.backend.dto.rank;

import lombok.Builder;
import lombok.Data;
import software.amazon.awssdk.services.rekognition.endpoints.internal.Value;

@Data
@Builder
public class GlobalMemberRankingResponse {
    private Long memberId;
    private String fullName;
    private Long totalStars;
    private String avatar;
    private Integer position;// 👈 thêm field avt
}
