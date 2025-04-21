package org.capstone.backend.utils.jwt;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.capstone.backend.dto.challenge.ChallengeRequest;
import org.capstone.backend.utils.enums.PrivacyStatus;

import java.time.LocalDate;

public class ChallengeRequestValidator implements ConstraintValidator<ValidChallengeRequest, ChallengeRequest> {

    @Override
    public boolean isValid(ChallengeRequest request, ConstraintValidatorContext context) {
        boolean isValid = true;
        context.disableDefaultConstraintViolation();

        LocalDate today = LocalDate.now();

        // 1. Start date must be after today + 1
        if (request.getStartDate() != null && !request.getStartDate().isAfter(today)) {
            context.buildConstraintViolationWithTemplate("Start date must be at least 1 day after today")
                   .addPropertyNode("startDate")
                   .addConstraintViolation();
            isValid = false;
        }

        // 2. End date must be after start date by at least 1 day
        if (request.getStartDate() != null && request.getEndDate() != null &&
                !request.getEndDate().isAfter(request.getStartDate())) {
            context.buildConstraintViolationWithTemplate("End date must be at least 1 day after start date")
                   .addPropertyNode("endDate")
                   .addConstraintViolation();
            isValid = false;
        }

        // 3. If public, then maxParticipants >= 2
        if (request.getPrivacy() == PrivacyStatus.PUBLIC &&
                (request.getMaxParticipants() == null || request.getMaxParticipants() < 2)) {
            context.buildConstraintViolationWithTemplate("Public challenges must have at least 2 participants")
                   .addPropertyNode("maxParticipants")
                   .addConstraintViolation();
            isValid = false;
        }

        return isValid;
    }
}
