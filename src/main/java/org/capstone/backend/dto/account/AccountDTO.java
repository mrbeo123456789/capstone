package org.capstone.backend.dto.account;

import lombok.Data;
import org.capstone.backend.utils.enums.AccountStatus;
import org.capstone.backend.utils.enums.Role;

import java.time.LocalDateTime;

@Data
public class AccountDTO {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private AccountStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}