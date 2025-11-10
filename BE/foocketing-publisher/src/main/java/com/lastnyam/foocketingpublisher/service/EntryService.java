package com.lastnyam.foocketingpublisher.service;

import com.lastnyam.foocketingpublisher.dto.FoocketingEntryPayload;
import com.lastnyam.foocketingpublisher.dto.FoocketingEntryResponseDto;
import com.lastnyam.foocketingpublisher.exception.FoocketingPublisherException;
import com.lastnyam.foocketingpublisher.exception.FoocketingPublisherErrorCode;
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
    
    private static final String TOPIC = "foocketing-entry";
    private static final String EVENT_TYPE = "FOOCKETING_ENTRY";
    private static final String SERVICE_NAME = "foocketing-publisher";

    /**
     * 푸켓팅 참여 정보를 Kafka에 전송
     * 
     * @param foocketingId 푸켓팅 ID
     * @param userId JWT에서 추출한 사용자 ID
     * @return 전송 성공 여부
     */
    public FoocketingEntryResponseDto sendFoocketingEntry(Integer foocketingId, Integer userId) {
        try {
            
            FoocketingEntryPayload payload = FoocketingEntryPayload.builder()
                    .foocketingId(foocketingId)
                    .userId(userId)
                    .build();
            
            // 권한 확인: claim의 userId와 entry의 userId가 일치하는지 확인
            validateUserAuthorization(payload.getUserId(), userId);
            
            // Kafka에 메시지 전송
            dynamicEventProducer.publish(TOPIC, EVENT_TYPE, SERVICE_NAME, payload);
            
            log.info("푸켓팅 참여 이벤트 전송 완료 - foocketingId: {}, userId: {}", 
                    foocketingId, userId);
            
            return FoocketingEntryResponseDto.builder()
                .success(true)
                .build();
            
        } catch (FoocketingPublisherException e) {
            log.warn("권한이 없습니다 - foocketingId: {}, userId: {}, error: {}", 
                    foocketingId, userId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("푸켓팅 참여 이벤트 전송 실패 - foocketingId: {}, userId: {}, error: {}", 
                    foocketingId, userId, e.getMessage(), e);
            return FoocketingEntryResponseDto.builder()
                .success(false)
                .build();
        }
    }

    /**
     * 권한 확인: JWT claim의 userId와 entry의 userId가 일치하는지 확인
     * 
     * @param entryUserId Entry에 포함된 userId
     * @param claimUserId JWT claim에서 추출한 userId
     * @throws FoocketingPublisherException 권한이 없는 경우
     */
    private void validateUserAuthorization(Integer entryUserId, Integer claimUserId) {
        if (!entryUserId.equals(claimUserId)) {
            throw new FoocketingPublisherException(FoocketingPublisherErrorCode.UNAUTHORIZED);
        }
    }
}

