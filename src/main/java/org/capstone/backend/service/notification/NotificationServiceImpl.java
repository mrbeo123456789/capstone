package org.capstone.backend.service.notification;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;
import org.capstone.backend.service.auth.AuthService;
import org.capstone.backend.utils.enums.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final Firestore db = FirestoreClient.getFirestore();

    @Autowired
    private AuthService authService;

    @Override
    public void sendNotification(String userId, String title, String content, NotificationType type) {
        Map<String, Object> docData = new HashMap<>();
        docData.put("userId", userId);
        docData.put("title", title);
        docData.put("content", content);
        docData.put("type", type.toString());
        docData.put("isRead",false);
        docData.put("createdAt", Timestamp.now());

        db.collection("notifications").add(docData);
    }

    @Override
    public List<Map<String, Object>> getNotifications(int limit, String lastCreatedAtStr) throws ExecutionException, InterruptedException {
        Long currentUserId = authService.getMemberIdFromAuthentication();

        Query query = db.collection("notifications")
                .whereEqualTo("userId", currentUserId)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .limit(limit);

        if (lastCreatedAtStr != null) {
            Instant lastCreatedAt = Instant.parse(lastCreatedAtStr);
            Timestamp lastTimestamp = Timestamp.ofTimeSecondsAndNanos(
                    lastCreatedAt.getEpochSecond(),
                    lastCreatedAt.getNano()
            );
            query = query.startAfter(lastTimestamp);
        }

        ApiFuture<QuerySnapshot> future = query.get();
        List<Map<String, Object>> results = new ArrayList<>();

        for (QueryDocumentSnapshot doc : future.get().getDocuments()) {
            Map<String, Object> data = doc.getData();
            data.put("id", doc.getId());
            results.add(data);
        }

        return results;
    }
}
