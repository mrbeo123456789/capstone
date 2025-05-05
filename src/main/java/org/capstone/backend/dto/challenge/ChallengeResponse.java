package org.capstone.backend.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.capstone.backend.utils.enums.ParticipationType;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChallengeResponse {
    private Long id;
    private String name;
    private String summary;
    private String picture;
    private LocalDate startDate;
    private LocalDate endDate;
    private String challengeTypeName;
    private ParticipationType participationType;

    // Số lượng tối đa thành viên (chỉ dùng khi participationType là INDIVIDUAL)
    private Integer maxParticipants;

    // Số lượng tối đa nhóm (chỉ dùng khi participationType là GROUP)
    private Integer maxGroups;

    // Số lượng tối đa thành viên mỗi nhóm (chỉ dùng khi participationType là GROUP)
    private Integer maxMembersPerGroup;

    /**
     * Constructor gọn cho các trường cơ bản và tham số mới
     */


    /**
     * Giữ lại constructor cũ nếu chỉ cần thông tin cơ bản
     */
    public ChallengeResponse(Long id,
                             String name,
                             String summary,
                             String picture,
                             ParticipationType participationType) {
        this.id = id;
        this.name = name;
        this.summary = summary;
        this.picture = picture;
        this.participationType = participationType;
    }
}
