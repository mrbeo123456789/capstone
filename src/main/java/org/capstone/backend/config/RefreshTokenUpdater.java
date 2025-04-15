package org.capstone.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Component
public class RefreshTokenUpdater {

    private static final String ENV_FILE_PATH = ".env";

    @Autowired
    private ConfigurableEnvironment environment;

    /**
     * Public method để controller/service gọi
     */
    public void updateAndReloadGoogleRefreshToken(String newRefreshToken) {
        updateRefreshTokenInEnvFile(newRefreshToken);
        reloadEnvironment(newRefreshToken);
    }

    /**
     * Ghi đè GOOGLE_REFRESH_TOKEN vào file .env
     */
    private void updateRefreshTokenInEnvFile(String newRefreshToken) {
        try {
            Path envPath = Paths.get(ENV_FILE_PATH);
            List<String> lines = Files.readAllLines(envPath);
            List<String> updatedLines = updateLinesWithNewToken(newRefreshToken, lines);

            Files.write(envPath, updatedLines, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.CREATE);

            System.out.println("✅ Cập nhật refresh token thành công vào .env (preserve thứ tự dòng)");
        } catch (IOException e) {
            System.err.println("❌ Lỗi khi ghi file .env: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Reload GOOGLE_REFRESH_TOKEN vào Spring Environment
     */
    private void reloadEnvironment(String newRefreshToken) {
        Map<String, Object> map = new HashMap<>();
        map.put("GOOGLE_REFRESH_TOKEN", newRefreshToken);

        // Gỡ property cũ nếu có
        environment.getPropertySources().remove("dynamic-refresh-token");

        // Add property mới
        MapPropertySource newPropertySource = new MapPropertySource("dynamic-refresh-token", map);
        environment.getPropertySources().addFirst(newPropertySource);

        System.out.println("✅ Environment đã reload GOOGLE_REFRESH_TOKEN mới.");
    }

    /**
     * Xử lý logic update dòng GOOGLE_REFRESH_TOKEN trong file
     */
    private static List<String> updateLinesWithNewToken(String newRefreshToken, List<String> lines) {
        List<String> updatedLines = new ArrayList<>();
        boolean replaced = false;

        for (String line : lines) {
            if (line.startsWith("GOOGLE_REFRESH_TOKEN=")) {
                updatedLines.add("GOOGLE_REFRESH_TOKEN=" + newRefreshToken);
                replaced = true;
            } else {
                updatedLines.add(line);
            }
        }

        if (!replaced) {
            updatedLines.add("GOOGLE_REFRESH_TOKEN=" + newRefreshToken);
        }

        return updatedLines;
    }
}
