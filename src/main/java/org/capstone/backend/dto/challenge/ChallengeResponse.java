package org.capstone.backend.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.capstone.backend.utils.enums.ParticipationType;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChallengeResponse {
    private Long id;
    private String name;
    private String summary;
    private String picture;
    private ParticipationType participationType;
}
