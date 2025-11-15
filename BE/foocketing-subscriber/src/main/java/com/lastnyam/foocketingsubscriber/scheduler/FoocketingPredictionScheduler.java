package com.lastnyam.foocketingsubscriber.scheduler;

import com.lastnyam.foocketingsubscriber.service.FoocketingService;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class FoocketingPredictionScheduler {

    private final AtomicInteger predictedReplicas = new AtomicInteger(2);
    private final FoocketingService foocketingService; // 푸켓팅 수를 조회하는 서비스

    // MeterRegistry를 주입받아 Gauge 메트릭을 생성
    public FoocketingPredictionScheduler(MeterRegistry registry, FoocketingService foocketingService) {
        this.foocketingService = foocketingService;
        Gauge.builder("foocketing.predicted.replicas", predictedReplicas, AtomicInteger::get)
                .description("다음 1시간 동안 예측되는 푸켓팅 서버 수")
                .register(registry);
    }

    // 매시 48분에 실행 (cron = "초 분 시 일 월 요일")
    @Scheduled(cron = "0 48 * * * *")
    public void updatePredictedReplicas() {
        // 1. 다음 1시간 동안의 푸켓팅 수를 DB 등에서 조회
        int upcomingFoocketingCount = foocketingService.getUpcomingCount();

        if (upcomingFoocketingCount > 3) {
            int required = 4;
            log.info("푸켓팅 예측 서버 수 업데이트: {}개", required);
            predictedReplicas.set(required);
        }
    }

    // 예측 시간이 끝나면 기본값으로 복원 (선택 사항)
    @Scheduled(cron = "0 45 * * * *")
    public void resetPredictedReplicas() {
        predictedReplicas.set(2);
    }
}
