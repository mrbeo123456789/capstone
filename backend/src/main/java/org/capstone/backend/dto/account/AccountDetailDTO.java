package org.capstone.backend.dto.account;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.capstone.backend.utils.enums.AccountStatus;
import org.capstone.backend.utils.enums.Role;

@Data
@AllArgsConstructor
public class AccountDetailDTO {
    private Long accountId;
    private String username;
    private String email;
    private String phone;
    private String avatar;
    private String address;
    private String dateOfBirth;
    private AccountStatus status;
    private Role role;
}
