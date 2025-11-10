package com.lastnyam.messaging.producer;

import com.lastnyam.messaging.dto.KafkaMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 동적으로 다양한 토픽과 이벤트 타입을 처리할 수 있는 범용 프로듀서
 * 토픽명, 이벤트 타입, 서비스명을 런타임에 지정 가능
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DynamicEventProducer {

    private final MessageProducer messageProducer;

    /**
     * 토픽, 이벤트 타입, 서비스명, 페이로드를 모두 지정하여 발행
     * 
     * @param topic 대상 토픽
     * @param eventType 이벤트 타입
     * @param serviceName 발행 서비스명
     * @param payload 페이로드
     */
    public <T> void publish(String topic, String eventType, String serviceName, T payload) {
        publish(topic, eventType, serviceName, payload, null);
    }

    /**
     * 토픽, 이벤트 타입, 서비스명, 페이로드, 키를 모두 지정하여 발행
     * 
     * @param topic 대상 토픽
     * @param eventType 이벤트 타입
     * @param serviceName 발행 서비스명
     * @param payload 페이로드
     * @param key 파티셔닝 키 (null이면 eventId 사용)
     */
    public <T> void publish(String topic, String eventType, String serviceName, T payload, String key) {
        KafkaMessage<T> message = KafkaMessage.of(eventType, serviceName, payload);
        
        if (key != null) {
            messageProducer.sendMessage(topic, key, message);
        } else {
            messageProducer.sendMessage(topic, message);
        }
        
        log.info("동적 이벤트 발행 - Topic: {}, EventType: {}, Service: {}, Key: {}", 
            topic, eventType, serviceName, key);
    }

    /**
     * 특정 파티션으로 이벤트 발행
     * 
     * @param topic 대상 토픽
     * @param partition 파티션 번호
     * @param eventType 이벤트 타입
     * @param serviceName 발행 서비스명
     * @param payload 페이로드
     * @param key 파티셔닝 키
     */
    public <T> void publishToPartition(String topic, Integer partition, String eventType, 
                                       String serviceName, T payload, String key) {
        KafkaMessage<T> message = KafkaMessage.of(eventType, serviceName, payload);
        messageProducer.sendMessage(topic, partition, key, message);
        
        log.info("동적 이벤트 발행 (파티션 지정) - Topic: {}, Partition: {}, EventType: {}, Service: {}", 
            topic, partition, eventType, serviceName);
    }

    /**
     * Builder 패턴을 사용한 이벤트 발행
     */
    public <T> EventBuilder<T> builder() {
        return new EventBuilder<>(this);
    }

    /**
     * 이벤트 발행을 위한 빌더 클래스
     */
    public static class EventBuilder<T> {
        private final DynamicEventProducer producer;
        private String topic;
        private String eventType;
        private String serviceName;
        private T payload;
        private String key;
        private Integer partition;

        private EventBuilder(DynamicEventProducer producer) {
            this.producer = producer;
        }

        public EventBuilder<T> topic(String topic) {
            this.topic = topic;
            return this;
        }

        public EventBuilder<T> eventType(String eventType) {
            this.eventType = eventType;
            return this;
        }

        public EventBuilder<T> serviceName(String serviceName) {
            this.serviceName = serviceName;
            return this;
        }

        public EventBuilder<T> payload(T payload) {
            this.payload = payload;
            return this;
        }

        public EventBuilder<T> key(String key) {
            this.key = key;
            return this;
        }

        public EventBuilder<T> partition(Integer partition) {
            this.partition = partition;
            return this;
        }

        public void publish() {
            if (topic == null || eventType == null || serviceName == null || payload == null) {
                throw new IllegalArgumentException("topic, eventType, serviceName, payload는 필수입니다");
            }

            if (partition != null) {
                producer.publishToPartition(topic, partition, eventType, serviceName, payload, key);
            } else {
                producer.publish(topic, eventType, serviceName, payload, key);
            }
        }
    }
}

