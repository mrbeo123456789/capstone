package org.capstone.backend.dto.auth;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@NoArgsConstructor
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
}
