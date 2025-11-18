package com.lastnyam.foocketingsubscriber.service;

import com.lastnyam.database.entity.DailyStatistics;
import com.lastnyam.foocketingsubscriber.repository.DailyStatisticsRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyStatisticsService {

    private final DailyStatisticsRepository dailyStatisticsRepository;

    /**
     * 푸켓팅 참여 수 증가
     */
    @Transactional
    public void incrementFoocketingCount(Integer shopId) {
        LocalDate today = LocalDate.now();
        DailyStatistics stat = getOrCreateDailyStatistics(shopId, today);
        
        DailyStatistics updated = DailyStatistics.builder()
                .statisticsId(stat.getStatisticsId())
                .shopId(stat.getShopId())
                .statDate(stat.getStatDate())
                .foocketingCount(stat.getFoocketingCount() + 1)
                .viewCount(stat.getViewCount())
                .orderCount(stat.getOrderCount())
                .orderRevenue(stat.getOrderRevenue())
                .createdAt(stat.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();
        
        dailyStatisticsRepository.save(updated);
        log.debug("푸켓팅 통계 증가 - shopId: {}, date: {}", shopId, today);
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
}

