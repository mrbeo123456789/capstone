package org.capstone.backend.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InvitationResponseDTO {
    private Long challengeId;
    private Long invitationId;
    private String challengeName;
    private String inviterInfo;
    private String challengeImage;
    private String invitationType; // "PERSONAL" hoặc "GROUP"

}
