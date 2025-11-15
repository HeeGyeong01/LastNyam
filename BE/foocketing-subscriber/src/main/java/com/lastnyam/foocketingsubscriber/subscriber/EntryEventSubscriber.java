package com.lastnyam.foocketingsubscriber.subscriber;

import com.lastnyam.foocketingsubscriber.service.FoocketingLogService;
import com.lastnyam.messaging.dto.FoocketingEntryMessage;
import com.lastnyam.messaging.dto.FoocketingEntryPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EntryEventSubscriber {

    private static final String TOPIC = "foocketing-entry";

    private final FoocketingLogService logService;

    @KafkaListener(
            topics = TOPIC,
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeEntryMessage(FoocketingEntryMessage entry, Acknowledgment ack) {
        try {
            FoocketingEntryPayload payload = entry.getPayload();
            log.info("전문 수신하였음. \n ======================\n FoocketingId: {} , UserId : {}\n =========================",
                    payload.getFoocketingId(), payload.getUserId());
            logService.processFoocketingEntry(payload);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("메시지 처리 실패: {}", e.getMessage());
        }
    }

}
