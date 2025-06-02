package org.capstone.backend.utils.enums;

public enum NotificationType {

    ACHIEVEMENT,
    INVITATION, // 📩 Gộp chung nếu bạn chỉ cần một loại "Lời mời" chung

    // ===== CHALLENGE FLOW =====
    CHALLENGE_STARTED,       // 🚀 Thử thách đã bắt đầu
    CHALLENGE_ENDED,         // 🏁 Thử thách đã kết thúc
    CHALLENGE_RESULT,        // 🏆 Kết quả thử thách (cá nhân/nhóm)
    REMINDER_SUBMIT_EVIDENCE,// ⏰ Nhắc nộp bằng chứng

    // ===== EVIDENCE =====
    EVIDENCE_RESULT,         // 📄 Kết quả chấm bằng chứng

    // ===== USER ROLE =====
    ROLE_UPDATE,             // 🧑‍🏫 Cập nhật vai trò (CO_HOST, HOST, etc.)

    // ===== SYSTEM =====
    SYSTEM_NOTIFICATION,     // 🔔 Thông báo hệ thống (bị kick, disband group...)
    SYSTEM_ANNOUNCEMENT,     // 📢 Thông báo chung toàn hệ thống

    // ===== ACHIEVEMENT =====
    ACHIEVEMENT_UNLOCKED     // 🥇 Mở khóa thành tựu
}

