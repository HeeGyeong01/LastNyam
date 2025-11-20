package com.lastnyam.foocketingsubscriber.subscriber;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lastnyam.foocketingsubscriber.dto.FoocketingEntryPayload;
import com.lastnyam.foocketingsubscriber.service.FoocketingLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EntryEventSubscriber {

    private static final String TOPIC = "foocketing-entry";

    private final ObjectMapper objectMapper;
    private final FoocketingLogService logService;

    @KafkaListener(
            topics = TOPIC,
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeEntryMessage(@Payload Object payload, Acknowledgment ack) {
        try {
            FoocketingEntryPayload entry = objectMapper.convertValue(
                    payload,
                    FoocketingEntryPayload.class
            );

            logService.processFoocketingEntry(entry);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("메시지 처리 실패: {}", e.getMessage());
        }
    }

}
