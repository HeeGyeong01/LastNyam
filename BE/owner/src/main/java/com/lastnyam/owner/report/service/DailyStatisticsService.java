package com.lastnyam.owner.report.service;

import com.lastnyam.database.entity.DailyStatistics;
import com.lastnyam.owner.report.repository.DailyStatisticsRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyStatisticsService {

    private final DailyStatisticsRepository dailyStatisticsRepository;
    private final DailyStatisticsAggregationService aggregationService;

    /**
     * 일일 통계 집계 스케줄러
     * 매일 오전 1시에 전날 데이터를 집계
     */
    @Transactional
    @Scheduled(cron = "0 0 1 * * *")
    public void aggregateDailyStatistics() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("일일 통계 집계 시작 - 날짜: {}", yesterday);
        
        aggregationService.aggregateStatisticsForDate(yesterday);
        
        log.info("일일 통계 집계 완료 - 날짜: {}", yesterday);
    }

    /**
     * 특정 날짜의 통계를 조회하거나 생성
     */
    @Transactional
    public DailyStatistics getOrCreateDailyStatistics(Integer shopId, LocalDate date) {
        Optional<DailyStatistics> existing = dailyStatisticsRepository.findByShopIdAndStatDate(shopId, date);
        
        if (existing.isPresent()) {
            return existing.get();
        }
        
        // 없으면 새로 생성 (초기값 0)
        DailyStatistics newStat = DailyStatistics.builder()
                .shopId(shopId)
                .statDate(date)
                .foocketingCount(0)
                .viewCount(0)
                .orderCount(0)
                .orderRevenue(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        return dailyStatisticsRepository.save(newStat);
    }

    /**
     * 조회수 증가
     */
    @Transactional
    public void incrementViewCount(Integer shopId) {
        LocalDate today = LocalDate.now();
        DailyStatistics stat = getOrCreateDailyStatistics(shopId, today);
        
        DailyStatistics updated = DailyStatistics.builder()
                .statisticsId(stat.getStatisticsId())
                .shopId(stat.getShopId())
                .statDate(stat.getStatDate())
                .foocketingCount(stat.getFoocketingCount())
                .viewCount(stat.getViewCount() + 1)
                .orderCount(stat.getOrderCount())
                .orderRevenue(stat.getOrderRevenue())
                .createdAt(stat.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();
        
        dailyStatisticsRepository.save(updated);
    }

    /**
     * 특정 기간의 일자별 통계 조회
     */
    public List<DailyStatistics> getDailyStatistics(Integer shopId, LocalDate startDate, LocalDate endDate) {
        return dailyStatisticsRepository.findByShopIdAndStatDateBetween(shopId, startDate, endDate);
    }
}

