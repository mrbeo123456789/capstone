package org.capstone.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "global_member_ranking")
public class GlobalMemberRanking {

    @Id
    private Long memberId;  // Primary key: id của Member

    @Column(name = "full_name", nullable = false)
    private String fullName;  // Tên đầy đủ của thành viên

    @Column(name = "total_stars", nullable = false)
    private Long totalStars;  // Tổng số sao nhận được

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;  // Thời điểm cập nhật gần nhất (optional nếu cần tracking)
}
