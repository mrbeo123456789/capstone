package org.capstone.backend.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.capstone.backend.utils.enums.ParticipationType;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChallengeResponse {
    private Long id;
    private String name;
    private String summary;
    private String picture;
    private LocalDate startDate;
    private LocalDate endDate;
    private String challengeTypeName;
    private ParticipationType participationType;

    public ChallengeResponse(Long id, String name, String summary, String picture, ParticipationType participationType) {
        this.id = id;
        this.name = name;
        this.summary = summary;
        this.picture = picture;
        this.participationType = participationType;
    }

}
