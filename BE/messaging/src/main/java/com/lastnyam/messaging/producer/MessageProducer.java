package com.lastnyam.messaging.producer;

import com.lastnyam.messaging.dto.KafkaMessage;

/**
 * 메시지 발행을 위한 공통 인터페이스
 * 다양한 메시징 시스템(Kafka, RabbitMQ 등)에 대한 추상화를 제공
 */
public interface MessageProducer {
    
    /**
     * 토픽과 키를 지정하여 메시지 전송
     * 
     * @param topic 메시지를 전송할 토픽
     * @param key 파티셔닝을 위한 키
     * @param message 전송할 메시지
     */
    <T> void sendMessage(String topic, String key, KafkaMessage<T> message);
    
    /**
     * 토픽만 지정하여 메시지 전송 (키는 eventId 사용)
     * 
     * @param topic 메시지를 전송할 토픽
     * @param message 전송할 메시지
     */
    <T> void sendMessage(String topic, KafkaMessage<T> message);
    
    /**
     * 특정 파티션을 지정하여 메시지 전송
     * 
     * @param topic 메시지를 전송할 토픽
     * @param partition 파티션 번호
     * @param key 파티셔닝을 위한 키
     * @param message 전송할 메시지
     */
    <T> void sendMessage(String topic, Integer partition, String key, KafkaMessage<T> message);
}

