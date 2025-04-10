package org.capstone.backend.utils.enums;

public enum GroupChallengeStatus {
    PENDING,  // Chỉ là lời mời, chưa join
    ONGOING,  // Đã join và đang tham gia
    ENDED,// hoàn thành thử thách
    CANCELLED,
    REJECTED  // Nếu group từ chối lời mời
}