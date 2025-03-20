package org.capstone.backend.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChallengeResponse {
    private Long id;            // Challenge ID
    private String name;         // Tên của Challenge
    private String summary;      // Tóm tắt ngắn gọn
    private String picture;      // Hình ảnh đại diện
}
