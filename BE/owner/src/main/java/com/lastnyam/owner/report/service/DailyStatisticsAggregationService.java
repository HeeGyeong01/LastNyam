package com.lastnyam.owner.report.service;

import com.lastnyam.database.entity.DailyStatistics;
import com.lastnyam.database.entity.DiscountTransaction;
import com.lastnyam.database.entity.DiscountTransactionItem;
import com.lastnyam.owner.report.repository.DailyStatisticsRepository;
import com.lastnyam.owner.transaction.repository.DiscountTransactionRepository;
import com.lastnyam.owner.transaction.repository.DiscountTransactionItemRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyStatisticsAggregationService {

    private final DailyStatisticsRepository dailyStatisticsRepository;
    private final DiscountTransactionRepository discountTransactionRepository;
    private final DiscountTransactionItemRepository discountTransactionItemRepository;

    /**
     * 특정 날짜의 통계를 집계
     */
    @Transactional
    public void aggregateStatisticsForDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        // 모든 shopId 조회 (주문이 있거나 푸켓팅이 있는 shop)
        List<Integer> shopIds = getActiveShopIds(date, startOfDay, endOfDay);

        for (Integer shopId : shopIds) {
            aggregateShopStatistics(shopId, date, startOfDay, endOfDay);
        }

        log.info("일일 통계 집계 완료 - 날짜: {}, 매장 수: {}", date, shopIds.size());
    }

    /**
     * 특정 매장의 특정 날짜 통계 집계
     */
    @Transactional
    public void aggregateShopStatistics(Integer shopId, LocalDate date, LocalDateTime startOfDay, LocalDateTime endOfDay) {
        // 푸켓팅 참여 수는 foocketing-subscriber에서 실시간으로 업데이트되므로
        // 집계 시점에는 이미 DailyStatistics에 저장되어 있음
        Optional<DailyStatistics> existing = dailyStatisticsRepository.findByShopIdAndStatDate(shopId, date);
        int foocketingCount = existing.map(DailyStatistics::getFoocketingCount).orElse(0);

        // 주문 건수 및 금액 집계
        Map<String, Integer> orderStats = aggregateOrders(shopId, startOfDay, endOfDay);
        int orderCount = orderStats.getOrDefault("count", 0);
        int orderRevenue = orderStats.getOrDefault("revenue", 0);

        // 조회수는 실시간으로 증가하므로 집계 시점에는 이미 저장되어 있음
        // 없으면 0으로 초기화
        int viewCount = existing.map(DailyStatistics::getViewCount).orElse(0);

        // 통계 저장 또는 업데이트
        // 푸켓팅과 조회수는 이미 실시간으로 업데이트되어 있으므로 유지
        // 주문 통계만 집계하여 업데이트
        DailyStatistics statistics;
        if (existing.isPresent()) {
            // 업데이트 (조회수는 유지, 나머지는 집계값으로 업데이트)
            statistics = DailyStatistics.builder()
                    .statisticsId(existing.get().getStatisticsId())
                    .shopId(shopId)
                    .statDate(date)
                    .foocketingCount(foocketingCount)
                    .viewCount(viewCount)
                    .orderCount(orderCount)
                    .orderRevenue(orderRevenue)
                    .createdAt(existing.get().getCreatedAt())
                    .updatedAt(LocalDateTime.now())
                    .build();
        } else {
            // 새로 생성
            statistics = DailyStatistics.builder()
                    .shopId(shopId)
                    .statDate(date)
                    .foocketingCount(foocketingCount)
                    .viewCount(viewCount)
                    .orderCount(orderCount)
                    .orderRevenue(orderRevenue)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        }

        dailyStatisticsRepository.save(statistics);
        log.debug("매장 통계 집계 완료 - shopId: {}, date: {}, foocketing: {}, order: {}, revenue: {}", 
                shopId, date, foocketingCount, orderCount, orderRevenue);
    }


    /**
     * 주문 건수 및 금액 집계
     */
    private Map<String, Integer> aggregateOrders(Integer shopId, LocalDateTime startOfDay, LocalDateTime endOfDay) {
        List<DiscountTransaction> transactions = discountTransactionRepository.findAll().stream()
                .filter(tx -> {
                    try {
                        return tx.getShop() != null && shopId.equals(tx.getShop().getShopId());
                    } catch (Exception e) {
                        log.warn("주문 조회 중 오류: {}", e.getMessage());
                        return false;
                    }
                })
                .filter(tx -> {
                    LocalDateTime createdAt = tx.getCreatedAt();
                    return createdAt != null && 
                           !createdAt.isBefore(startOfDay) && 
                           !createdAt.isAfter(endOfDay);
                })
                .collect(Collectors.toList());

        int count = transactions.size();
        
        // 주문 금액 계산 (DiscountTransactionItem의 가격 합계)
        int revenue = 0;
        List<Integer> transactionIds = transactions.stream()
                .map(DiscountTransaction::getTransactionId)
                .collect(Collectors.toList());
        
        if (!transactionIds.isEmpty()) {
            List<DiscountTransactionItem> items = discountTransactionItemRepository.findByTransactionIdIn(transactionIds);
            revenue = items.stream()
                    .mapToInt(item -> {
                        try {
                            if (item.getDiscount() != null && item.getTransactionAmount() != null) {
                                return item.getDiscount().getDiscountPrice() * item.getTransactionAmount();
                            }
                        } catch (Exception e) {
                            log.warn("주문 금액 계산 중 오류: {}", e.getMessage());
                        }
                        return 0;
                    })
                    .sum();
        }

        return Map.of("count", count, "revenue", revenue);
    }

    /**
     * 활성 매장 ID 목록 조회 (해당 날짜에 활동이 있는 매장)
     */
    private List<Integer> getActiveShopIds(LocalDate date, LocalDateTime startOfDay, LocalDateTime endOfDay) {
        Set<Integer> shopIds = new HashSet<>();
        
        // 주문이 있는 shopId
        discountTransactionRepository.findAll().stream()
                .filter(tx -> {
                    LocalDateTime createdAt = tx.getCreatedAt();
                    return createdAt != null && 
                           !createdAt.isBefore(startOfDay) && 
                           !createdAt.isAfter(endOfDay);
                })
                .forEach(tx -> {
                    try {
                        if (tx.getShop() != null) {
                            shopIds.add(tx.getShop().getShopId());
                        }
                    } catch (Exception e) {
                        log.warn("매장 ID 조회 중 오류: {}", e.getMessage());
                    }
                });
        
        // 푸켓팅 통계는 foocketing-subscriber에서 실시간으로 업데이트되므로
        // DailyStatistics에 이미 저장되어 있는 shopId도 포함
        // (현재는 주문이 있는 shopId만 집계하지만, 필요시 DailyStatistics에서도 조회 가능)
        
        return shopIds.stream().collect(Collectors.toList());
    }
}

