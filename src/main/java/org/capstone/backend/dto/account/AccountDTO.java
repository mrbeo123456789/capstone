package org.capstone.backend.dto.account;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.capstone.backend.utils.enums.AccountStatus;
import org.capstone.backend.utils.enums.Role;

import java.time.LocalDateTime;
@AllArgsConstructor
@Data
@NoArgsConstructor
public class AccountDTO {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private AccountStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}