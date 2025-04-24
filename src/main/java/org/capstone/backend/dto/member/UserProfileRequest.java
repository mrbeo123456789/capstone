package org.capstone.backend.dto.member;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.capstone.backend.utils.enums.InvitePermission;

import java.time.LocalDate;

@Data
public class UserProfileRequest {
        @NotBlank(message = "Full name cannot be empty")
        @Size(max = 50, message = "Full name cannot exceed 50 characters")
        private String fullName;

//        @NotBlank(message = "First name cannot be empty")
//        @Size(max = 50, message = "First name cannot exceed 50 characters")
//        private String firstName;

//        @NotBlank(message = "Last name cannot be empty")
//        @Size(max = 50, message = "Last name cannot exceed 50 characters")
//        private String lastName;

  //      @Pattern(regexp = "MALE|FEMALE|OTHER", message = "Gender must be Male, Female, or Other")
        private String gender;

//        @NotBlank(message = "Phone number cannot be empty")
//        @Pattern(regexp = "\\d{9,11}", message = "Phone number must be between 9 and 11 digits")
        private String phone;

        private String address;

        private String ward;

        private String province;

        private String district;

        @Past(message = "Date of birth must be in the past")
        private LocalDate dateOfBirth;
        private InvitePermission invitePermission;

        private String avt;
    }


