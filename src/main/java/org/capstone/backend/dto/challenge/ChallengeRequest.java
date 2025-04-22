package org.capstone.backend.dto.challenge;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.capstone.backend.utils.enums.PrivacyStatus;
import org.capstone.backend.utils.enums.ParticipationType;
import org.capstone.backend.utils.enums.VerificationType;
import org.capstone.backend.utils.jwt.ValidChallengeRequest;

import java.time.LocalDate;

@ValidChallengeRequest  // <-- Class-level custom validator
@Data
public class ChallengeRequest {

    @NotBlank(message = "Name cannot be empty")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    private String summary;

    @NotBlank(message = "Description cannot be empty")
    @Size(min = 10, message = "Description cannot be under 10 characters")
    private String description;

    @NotNull(message = "Privacy must be provided")
    private PrivacyStatus privacy;

    @NotNull(message = "Verification type must be provided")
    private VerificationType verificationType;

    @NotNull(message = "ParticipationType must be provided")
    private ParticipationType participationType;

    @NotNull(message = "Start date must be provided")
    @Future(message = "Start date must be in the future")
    private LocalDate startDate;

    @NotNull(message = "End date must be provided")
    @Future(message = "End date must be in the future")
    private LocalDate endDate;

    // Cá nhân: số lượng tối đa người tham gia
    // Nhóm: không bắt buộc ở cấp DTO, validator class-level sẽ kiểm tra
    @Positive(message = "Max participants must be a positive number")
    private Integer maxParticipants;

    // ----- 2 trường mới cho GROUP -----
    // Tổng số nhóm tối đa được tham gia
    @Positive(message = "Max groups must be a positive number")
    private Integer maxGroups;

    // Số thành viên tối đa mỗi nhóm
    @Positive(message = "Max members per group must be a positive number")
    private Integer maxMembersPerGroup;
    // -----------------------------------

    // Cho biết người dùng có thể tham gia thử thách hay không
    @NotNull(message = "Participation flag must be provided")
    private Boolean isParticipate;

    @NotNull(message = "Challenge Type ID must be provided")
    private Long challengeTypeId;
}
