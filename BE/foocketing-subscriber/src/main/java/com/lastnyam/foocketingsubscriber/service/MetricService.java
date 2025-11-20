package com.lastnyam.foocketingsubscriber.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MetricService {
    private final MeterRegistry registry;

    public void incrementParticipantOf(Integer foocketingId) {
        Counter.builder("foocketing_participant_count")
                .tag("foocketingId", String.valueOf(foocketingId))
                .description("푸켓팅 참가자 수")
                .register(registry)
                .increment();
    }
}
