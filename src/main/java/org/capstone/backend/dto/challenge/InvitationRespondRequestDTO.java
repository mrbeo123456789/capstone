package org.capstone.backend.dto.challenge;

import lombok.Data;

import jakarta.validation.constraints.NotNull;

/**
 * DTO để xử lý khi thành viên phản hồi lời mời tham gia thử thách.
 */
@Data
public class InvitationRespondRequestDTO {

    @NotNull(message = "Invitation ID cannot be null.")
    private Long invitationId;

    @NotNull(message = "Invitation type cannot be null.")
    private String invitationType; // "PERSONAL" hoặc "GROUP"

    private Long groupId;  // Có thể null nếu type là PERSONAL

    @NotNull(message = "Accept status must be provided.")
    private Boolean accept;
}
