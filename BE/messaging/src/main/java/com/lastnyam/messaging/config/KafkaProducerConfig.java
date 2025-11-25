package com.lastnyam.messaging.config;

import java.util.HashMap;
import java.util.Map;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

/**
 * Kafka Producer 설정 KafkaMessageProducer에서 사용하는 KafkaTemplate을 구성합니다.
 */
@Configuration
public class KafkaProducerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    /**
     * Kafka Producer Factory 설정 - Key: String, Value: Object (JSON 직렬화) - 멱등성 활성화로 중복 메시지 방지 - acks=all로 모든 복제본 확인
     */
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();

        // 기본 설정
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        // 신뢰성 설정
        configProps.put(ProducerConfig.ACKS_CONFIG, "1");
        // 모든 복제본 확인
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);  // 멱등성 (중복 방지)
        configProps.put(ProducerConfig.RETRIES_CONFIG, 1);  // 재시도 횟수

        // 성능 최적화
        configProps.put(ProducerConfig.LINGER_MS_CONFIG, 0);  // 배치 전송 대기 시간
        configProps.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "lz4");
        configProps.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);  // 배치 크기
        configProps.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 33554432);  // 버퍼 메모리

        return new DefaultKafkaProducerFactory<>(configProps);
    }

    /**
     * KafkaTemplate Bean DynamicEventProducer와 KafkaMessageProducer에서 사용
     */
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}

