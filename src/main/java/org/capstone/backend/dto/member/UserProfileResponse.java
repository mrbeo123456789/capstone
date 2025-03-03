package org.capstone.backend.dto.member;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UserProfileResponse {
    private String firstName;
    private String lastName;
    private Integer age;
    private String gender;
    private String phone;
    private String avatar;
    private String address;
    private String country;
    private LocalDate dateOfBirth;
}
