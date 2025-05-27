package com.poly.datn.be.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.retry.backoff.ExponentialBackOffPolicy;
import org.springframework.retry.policy.SimpleRetryPolicy;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;
import java.time.Duration;

@Configuration
public class OAuth2RetryConfig {

    @Bean
    public RetryTemplate retryTemplate() {
        RetryTemplate retryTemplate = new RetryTemplate();
        
        // Cấu hình backoff - thời gian chờ giữa các lần thử lại
        ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
        backOffPolicy.setInitialInterval(1000); // 1 giây
        backOffPolicy.setMultiplier(2.0);
        backOffPolicy.setMaxInterval(10000); // 10 giây
        retryTemplate.setBackOffPolicy(backOffPolicy);
        
        // Cấu hình retry policy
        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy();
        retryPolicy.setMaxAttempts(3);
        retryTemplate.setRetryPolicy(retryPolicy);
        
        return retryTemplate;
    }

    @Bean
    public WebClient oauth2WebClient() {
        // Cấu hình connection provider với các thông số tối ưu
        ConnectionProvider provider = ConnectionProvider.builder("oauth2-connection-pool")
            .maxConnections(500)
            .maxIdleTime(Duration.ofSeconds(20))
            .maxLifeTime(Duration.ofSeconds(60))
            .pendingAcquireTimeout(Duration.ofSeconds(60))
            .evictInBackground(Duration.ofSeconds(120))
            .build();

        // Cấu hình HttpClient với các timeout và retry
        HttpClient httpClient = HttpClient.create(provider)
            .responseTimeout(Duration.ofSeconds(30))
            .keepAlive(true)
            .wiretap(true);

        return WebClient.builder()
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .build();
    }
} 