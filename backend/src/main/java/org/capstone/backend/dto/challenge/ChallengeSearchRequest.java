package org.capstone.backend.dto.challenge;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChallengeSearchRequest {
    private Long challengeid;
    @NotBlank(message = "Từ khóa tìm kiếm không được để trống.")
    private String keyword;
}
