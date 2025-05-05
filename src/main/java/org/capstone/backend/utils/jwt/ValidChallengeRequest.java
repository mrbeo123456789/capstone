package org.capstone.backend.utils.jwt;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ChallengeRequestValidator.class)
@Target({ ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidChallengeRequest {
    String message() default "Invalid ChallengeRequest fields";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
