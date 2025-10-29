package com.lastnyam.messaging.producer;

import com.lastnyam.messaging.dto.KafkaMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

/**
 * Kafka 기반 메시지 프로듀서 구현체
 * MessageProducer 인터페이스를 구현하여 Kafka로 메시지 전송
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaMessageProducer implements MessageProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public <T> void sendMessage(String topic, String key, KafkaMessage<T> message) {
        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, key, message);
        
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("메시지 전송 성공 - Topic: {}, Key: {}, Partition: {}, Offset: {}", 
                    topic, key, 
                    result.getRecordMetadata().partition(), 
                    result.getRecordMetadata().offset());
            } else {
                log.error("메시지 전송 실패 - Topic: {}, Key: {}, Error: {}", 
                    topic, key, ex.getMessage());
            }
        });
    }

    @Override
    public <T> void sendMessage(String topic, KafkaMessage<T> message) {
        sendMessage(topic, message.getEventId(), message);
    }

    @Override
    public <T> void sendMessage(String topic, Integer partition, String key, KafkaMessage<T> message) {
        CompletableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send(topic, partition, key, message);
        
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("메시지 전송 성공 (파티션 지정) - Topic: {}, Partition: {}, Key: {}, Offset: {}", 
                    topic, partition, key, result.getRecordMetadata().offset());
            } else {
                log.error("메시지 전송 실패 (파티션 지정) - Topic: {}, Partition: {}, Key: {}, Error: {}", 
                    topic, partition, key, ex.getMessage());
            }
        });
    }
}

