package org.capstone.backend.service.notification;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.capstone.backend.dto.notification.NotificationResponse;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.NotificationType;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    // Khởi tạo Firestore thông qua FirestoreClient
    private final Firestore db = FirestoreClient.getFirestore();
    private final AuthService authService;

    @Override
    public void sendNotification(String userId, String title, String content, NotificationType type) {
        Map<String, Object> docData = Map.of(
                "userId", userId,
                "title", title,
                "content", content,
                "type", type.toString(),
                "isRead", false,
                "createdAt", Timestamp.now()
        );
        db.collection("notifications").add(docData);
    }

    @Override
    @SneakyThrows  // Cho phép ném các checked exception ra ngoài mà không cần try-catch
    public NotificationResponse getNotifications(int limit, String lastCreatedAtStr) {
        Long currentUserId = authService.getMemberIdFromAuthentication();

        Query query = db.collection("notifications")
                .whereEqualTo("userId", String.valueOf(currentUserId))
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .limit(limit);

        if (lastCreatedAtStr != null && !lastCreatedAtStr.isEmpty()) {
            // Nếu định dạng không hợp lệ, Instant.parse sẽ tự ném DateTimeParseException (unchecked exception)
            Instant lastCreatedAt = Instant.parse(lastCreatedAtStr);
            Timestamp lastTimestamp = Timestamp.ofTimeSecondsAndNanos(
                    lastCreatedAt.getEpochSecond(),
                    lastCreatedAt.getNano()
            );
            query = query.startAfter(lastTimestamp);
        }

        // Sử dụng query.get().get() để lấy kết quả của truy vấn (việc này có thể ném checked exception, được @SneakyThrows xử lý)
        QuerySnapshot snapshot = query.get().get();

        // Sử dụng Stream để chuyển đổi danh sách document thành List<Map<String, Object>>
        List<Map<String, Object>> results = snapshot.getDocuments().stream()
                .map(doc -> {
                    Map<String, Object> data = doc.getData();
                    data.put("id", doc.getId());
                    return data;
                })
                .collect(Collectors.toList());

        return new NotificationResponse(currentUserId, results);
    }
}
