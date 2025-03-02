package org.capstone.backend.dto.member;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserProfileRequest {
        @NotBlank(message = "First name cannot be empty")
        @Size(max = 50, message = "First name cannot exceed 50 characters")
        private String firstName;

        @NotBlank(message = "Last name cannot be empty")
        @Size(max = 50, message = "Last name cannot exceed 50 characters")
        private String lastName;

        @Min(value = 1, message = "Age must be at least 1")
        @Max(value = 120, message = "Age must be at most 120")
        private Integer age;

        @NotBlank(message = "Gender cannot be empty")
        @Pattern(regexp = "Male|Female|Other", message = "Gender must be Male, Female, or Other")
        private String gender;

        @NotBlank(message = "Phone number cannot be empty")
        @Pattern(regexp = "\\d{10,15}", message = "Phone number must be between 10 and 15 digits")
        private String phone;

        private String avatar;

        @NotBlank(message = "Address cannot be empty")
        private String address;

        @NotBlank(message = "Country cannot be empty")
        private String country;

        @Past(message = "Date of birth must be in the past")
        private LocalDate dateOfBirth;

        private String avt;
    }


