package org.capstone.backend.utils.key;

import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeProgressRankingId implements java.io.Serializable {
    private Long challengeId;
    private Long memberId;
}
