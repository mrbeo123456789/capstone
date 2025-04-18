package org.capstone.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.credentials-path:}")
    private String firebaseCredentialsPath;

    @PostConstruct
    public void initialize() {
        try {
            InputStream serviceAccount = loadServiceAccount();

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build(); // ❌ Không cần .setStorageBucket(...) nếu không dùng Firebase Storage

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase initialized successfully");
            } else {
                System.out.println("ℹ️ Firebase already initialized, skipping...");
            }

        } catch (Exception e) {
            System.err.println("❌ Failed to initialize Firebase: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private InputStream loadServiceAccount() throws Exception {
        if (firebaseCredentialsPath != null && !firebaseCredentialsPath.isBlank()) {
            File file = new File(firebaseCredentialsPath);
            if (!file.exists()) {
                throw new IllegalArgumentException("❌ Firebase credential file not found at: " + firebaseCredentialsPath);
            }
            System.out.println("🔐 Loading Firebase credentials from path: " + firebaseCredentialsPath);
            return new FileInputStream(file);
        }

        InputStream fallback = getClass().getClassLoader()
                .getResourceAsStream("bookstore-f9ac2-firebase-adminsdk-549wl-1314826c10.json");

        if (fallback == null) {
            throw new IllegalStateException("❌ Firebase JSON not found in resources or configured path");
        }

        System.out.println("🔐 Loading Firebase credentials from classpath");
        return fallback;
    }
}
