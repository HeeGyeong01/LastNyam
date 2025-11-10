package com.lastnyam.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KafkaMessage<T> {
    
    private String eventId;
    private String eventType;
    private LocalDateTime timestamp;
    private String source;
    private T payload;
    
    public static <T> KafkaMessage<T> of(String eventType, String source, T payload) {
        return KafkaMessage.<T>builder()
                .eventId(java.util.UUID.randomUUID().toString())
                .eventType(eventType)
                .timestamp(LocalDateTime.now())
                .source(source)
                .payload(payload)
                .build();
    }
}

