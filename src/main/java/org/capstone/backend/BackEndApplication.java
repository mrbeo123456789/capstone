package org.capstone.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
@EnableJpaAuditing(auditorAwareRef = "auditorAware")

public class BackEndApplication {

    public static void main(String[] args) {

        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing() // Cho phép chạy tiếp nếu không có file .env
                .load();


        // Nếu cần tích hợp với Spring Boot, bạn có thể chuyển các giá trị từ dotenv vào System properties:
        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );

        SpringApplication.run(BackEndApplication.class, args);
    }

}
