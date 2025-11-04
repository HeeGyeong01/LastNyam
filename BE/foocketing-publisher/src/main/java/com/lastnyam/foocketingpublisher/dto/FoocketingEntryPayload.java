package com.lastnyam.foocketingpublisher.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Kafka에 전송할 푸켓팅 참여 정보 페이로드
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingEntryPayload {
    
    private Integer foocketingId;
    private String userId;
}

