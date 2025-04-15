package org.capstone.backend.config;

import lombok.Getter;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@Getter
@Service
public class EnvService {

    private static final String ENV_FILE_PATH = ".env";

    private volatile String googleRefreshToken;

    @PostConstruct
    public void init() {
        loadRefreshToken();
        watchEnvFile();
    }

    private void loadRefreshToken() {
        try {
            List<String> lines = Files.readAllLines(Paths.get(ENV_FILE_PATH));
            for (String line : lines) {
                if (line.startsWith("GOOGLE_REFRESH_TOKEN=")) {
                    googleRefreshToken = line.substring("GOOGLE_REFRESH_TOKEN=".length()).trim();
                    System.out.println("✅ Reloaded GOOGLE_REFRESH_TOKEN into memory: " + googleRefreshToken);
                    return;
                }
            }
            System.err.println("⚠️ GOOGLE_REFRESH_TOKEN not found in .env file.");
        } catch (IOException e) {
            System.err.println("❌ Error loading .env file: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void watchEnvFile() {
        new Thread(() -> {
            try {
                WatchService watchService = FileSystems.getDefault().newWatchService();
                Paths.get(".").register(watchService, StandardWatchEventKinds.ENTRY_MODIFY);

                while (true) {
                    WatchKey key = watchService.take();
                    for (WatchEvent<?> event : key.pollEvents()) {
                        if (event.context().toString().equals(".env")) {
                            System.out.println("♻️ .env file modified. Reloading GOOGLE_REFRESH_TOKEN...");
                            loadRefreshToken();
                        }
                    }
                    key.reset();
                }
            } catch (Exception e) {
                System.err.println("❌ Error watching .env file: " + e.getMessage());
                e.printStackTrace();
            }
        }).start();
    }
}
