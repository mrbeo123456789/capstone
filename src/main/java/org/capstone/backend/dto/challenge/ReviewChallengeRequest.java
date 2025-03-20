// ReviewChallengeRequest.java
package org.capstone.backend.dto.challenge;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReviewChallengeRequest {

    @NotNull(message = "Challenge ID cannot be null")
    private Long challengeId;

    @NotNull(message = "Status cannot be null")
    private String status;

    private String adminNote;


}
