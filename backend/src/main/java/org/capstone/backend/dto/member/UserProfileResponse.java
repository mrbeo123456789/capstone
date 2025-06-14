package org.capstone.backend.dto.member;

import lombok.Data;
import org.capstone.backend.utils.enums.InvitePermission;

import java.time.LocalDate;

@Data
public class UserProfileResponse {
    private String email;
    private String username;
    private String fullName;
    private String firstName;
    private String lastName;
    private String gender;
    private String phone;
    private String avatar;
    private String address;
    private String ward;
    private String province;
    private String district;
    private LocalDate dateOfBirth;
    private InvitePermission invitePermission;

}
