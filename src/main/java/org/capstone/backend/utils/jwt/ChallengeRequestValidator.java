package org.capstone.backend.utils.jwt;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.capstone.backend.dto.challenge.ChallengeRequest;
import org.capstone.backend.utils.enums.ParticipationType;
import org.capstone.backend.utils.enums.PrivacyStatus;

import java.time.LocalDate;

public class ChallengeRequestValidator implements ConstraintValidator<ValidChallengeRequest, ChallengeRequest> {

    @Override
    public boolean isValid(ChallengeRequest request, ConstraintValidatorContext context) {
        boolean isValid = true;
        context.disableDefaultConstraintViolation();

        LocalDate today = LocalDate.now();

        // 1. Start date phải sau ngày hôm nay
        if (request.getStartDate() != null && !request.getStartDate().isAfter(today)) {
            context.buildConstraintViolationWithTemplate("Start date must be at least 1 day after today")
                    .addPropertyNode("startDate")
                    .addConstraintViolation();
            isValid = false;
        }

        // 2. End date phải sau start date
        if (request.getStartDate() != null && request.getEndDate() != null &&
                !request.getEndDate().isAfter(request.getStartDate())) {
            context.buildConstraintViolationWithTemplate("End date must be at least 1 day after start date")
                    .addPropertyNode("endDate")
                    .addConstraintViolation();
            isValid = false;
        }

        // 3. Nếu public, thì maxParticipants phải >= 2
        if (request.getPrivacy() == PrivacyStatus.PUBLIC &&
                (request.getMaxParticipants() == null || request.getMaxParticipants() < 2)) {
            context.buildConstraintViolationWithTemplate("Public challenges must have at least 2 participants")
                    .addPropertyNode("maxParticipants")
                    .addConstraintViolation();
            isValid = false;
        }

        // 4. Kiểm tra theo participationType
        if (request.getParticipationType() == ParticipationType.INDIVIDUAL) {
            // Cá nhân: bắt buộc maxParticipants và phải >2
            if (request.getMaxParticipants() == null) {
                context.buildConstraintViolationWithTemplate("Individual challenges must specify maxParticipants")
                        .addPropertyNode("maxParticipants")
                        .addConstraintViolation();
                isValid = false;
            } else if (request.getMaxParticipants() <= 2) {
                context.buildConstraintViolationWithTemplate("Individual challenges require more than 2 participants")
                        .addPropertyNode("maxParticipants")
                        .addConstraintViolation();
                isValid = false;
            }
        } else if (request.getParticipationType() == ParticipationType.GROUP) {
            // Nhóm: bắt buộc maxGroups và phải >=2
            if (request.getMaxGroups() == null) {
                context.buildConstraintViolationWithTemplate("Group challenges must specify maxGroups")
                        .addPropertyNode("maxGroups")
                        .addConstraintViolation();
                isValid = false;
            } else if (request.getMaxGroups() < 2) {
                context.buildConstraintViolationWithTemplate("Group challenges require at least 2 groups")
                        .addPropertyNode("maxGroups")
                        .addConstraintViolation();
                isValid = false;
            }

            // Nhóm: bắt buộc maxMembersPerGroup và phải >=2
            if (request.getMaxMembersPerGroup() == null) {
                context.buildConstraintViolationWithTemplate("Group challenges must specify maxMembersPerGroup")
                        .addPropertyNode("maxMembersPerGroup")
                        .addConstraintViolation();
                isValid = false;
            } else if (request.getMaxMembersPerGroup() < 2) {
                context.buildConstraintViolationWithTemplate("Group challenges require at least 2 members per group")
                        .addPropertyNode("maxMembersPerGroup")
                        .addConstraintViolation();
                isValid = false;
            }
        }

        return isValid;
    }
}
