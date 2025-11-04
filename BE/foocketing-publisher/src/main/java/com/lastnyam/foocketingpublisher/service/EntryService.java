package com.lastnyam.foocketingpublisher.service;

import com.lastnyam.foocketingpublisher.dto.FoocketingEntryPayload;
import com.lastnyam.foocketingpublisher.dto.FoocketingEntryResponseDto;
import com.lastnyam.messaging.producer.DynamicEventProducer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 푸켓팅 참여 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EntryService {

    private final DynamicEventProducer dynamicEventProducer;
    
    // TODO: 실제 인증 구현 후 동적 userId로 변경
    private static final String DEFAULT_USER_ID = "USER_001";
    
    private static final String TOPIC = "foocketing-entry";
    private static final String EVENT_TYPE = "FOOCKETING_ENTRY";
    private static final String SERVICE_NAME = "foocketing-publisher";

    /**
     * 푸켓팅 참여 정보를 Kafka에 전송
     * 
     * @param foocketingId 푸켓팅 ID
     * @return 전송 성공 여부
     */
    public FoocketingEntryResponseDto sendFoocketingEntry(Integer foocketingId) {
        try {
            FoocketingEntryPayload payload = FoocketingEntryPayload.builder()
                    .foocketingId(foocketingId)
                    .userId(DEFAULT_USER_ID)
                    .build();
            
            // Kafka에 메시지 전송
            dynamicEventProducer.publish(TOPIC, EVENT_TYPE, SERVICE_NAME, payload);
            
            log.info("푸켓팅 참여 이벤트 전송 완료 - foocketingId: {}, userId: {}", 
                    foocketingId, DEFAULT_USER_ID);
            
            return FoocketingEntryResponseDto.builder()
                .success(true)
                .build();
            
        } catch (Exception e) {
            log.error("푸켓팅 참여 이벤트 전송 실패 - foocketingId: {}, error: {}", 
                    foocketingId, e.getMessage(), e);
            return FoocketingEntryResponseDto.builder()
                .success(false)
                .build();
        }
    }
}

