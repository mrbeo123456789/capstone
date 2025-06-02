package org.capstone.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class SchedulingConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);  // Số luồng tối thiểu
        executor.setMaxPoolSize(10); // Số luồng tối đa
        executor.setQueueCapacity(100); // Độ dài hàng đợi
        executor.setThreadNamePrefix("Scheduler-");
        executor.initialize();
        return executor;
    }
}
