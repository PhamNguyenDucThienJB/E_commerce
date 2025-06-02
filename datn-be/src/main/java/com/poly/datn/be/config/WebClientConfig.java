package com.poly.datn.be.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.tcp.TcpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient.Builder webClientBuilder() {
        TcpClient tcpClient = TcpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 60000)
                .doOnConnected(connection -> {
                    connection.addHandlerLast(new ReadTimeoutHandler(60000, TimeUnit.MILLISECONDS));
                    connection.addHandlerLast(new WriteTimeoutHandler(60000, TimeUnit.MILLISECONDS));
                });

        HttpClient httpClient = HttpClient.from(tcpClient)
                .wiretap(true)
                .keepAlive(true)
                .responseTimeout(Duration.ofMillis(60000));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient));
    }
    @Bean
    public WebClient webClient(WebClient.Builder builder) {
        return builder.build();
    }

} 