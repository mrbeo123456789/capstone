package org.capstone.backend.dto.challenge;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.capstone.backend.utils.enums.PrivacyStatus;
import org.capstone.backend.utils.enums.ParticipationType;
import org.capstone.backend.utils.enums.VerificationType;

import java.time.LocalDate;

@Data
public class ChallengeRequest {

    @NotBlank(message = "Name cannot be empty")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    private String summary;

    @NotBlank(message = "Description cannot be empty")
    @Size(min = 10 , message = "Description cannot be under 10 character")
    private String description;


    @NotNull(message = "Privacy must be provided")
    private PrivacyStatus privacy;

    @NotNull(message = "Verification type must be provided")
    private VerificationType verificationType;

    private ParticipationType participationType;

    @NotNull(message = "Start date must be provided")
    @Future(message = "Start date must be in the future")
    private LocalDate startDate;

    @NotNull(message = "End date must be provided")
    @Future(message = "End date must be in the future")
    private LocalDate endDate;

    @NotNull(message = "Max participants must be provided")
    @Positive(message = "Max participants must be a positive number")
    private Integer maxParticipants;

//    @NotNull(message = "Challenge Type ID must be provided")
    private Long challengeTypeId;
}