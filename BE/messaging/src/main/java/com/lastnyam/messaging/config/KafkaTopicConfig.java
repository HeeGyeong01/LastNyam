package com.lastnyam.messaging.config;

import java.util.HashMap;
import java.util.Map;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaAdmin;

/**
 * Kafka Topic 설정
 */
@Configuration
public class KafkaTopicConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    /**
     * Kafka Admin Client
     * 토픽 생성 및 관리를 위한 클라이언트
     */
    @Bean
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        return new KafkaAdmin(configs);
    }

    /**
     * 티켓팅 요청 토픽
     *
     * - partitions: 6개 (처리 서버 최대 개수와 동일)
     * - replicas: 1개 (단일 Kafka 서버이므로)
     */
    @Bean
    public NewTopic ticketingRequestTopic() {
        return TopicBuilder.name("foocketing-entry")
                .partitions(1)
                .replicas(1)
                .build();
    }

}

