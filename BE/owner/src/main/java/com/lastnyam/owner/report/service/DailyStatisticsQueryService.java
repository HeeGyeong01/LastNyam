package com.lastnyam.owner.report.service;

import com.lastnyam.database.entity.DailyStatistics;
import com.lastnyam.owner.report.dto.DailyStatisticsResponse;
import com.lastnyam.owner.report.dto.DailyStatisticsResponse.CorrelationAnalysis;
import com.lastnyam.owner.report.dto.DailyStatisticsResponse.DailyStat;
import com.lastnyam.owner.report.dto.DailyStatisticsResponse.Summary;
import com.lastnyam.owner.report.repository.DailyStatisticsRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyStatisticsQueryService {

    private final DailyStatisticsRepository dailyStatisticsRepository;

    /**
     * 일자별 통계 조회
     */
    @Transactional(readOnly = true)
    public DailyStatisticsResponse getDailyStatistics(
            Integer shopId, 
            LocalDate startDate, 
            LocalDate endDate) {
        
        List<DailyStatistics> stats = dailyStatisticsRepository
                .findByShopIdAndStatDateBetween(shopId, startDate, endDate);

        // DailyStat 리스트 생성
        List<DailyStat> dailyStats = stats.stream()
                .map(stat -> DailyStat.builder()
                        .date(stat.getStatDate())
                        .foocketingCount(stat.getFoocketingCount())
                        .viewCount(stat.getViewCount())
                        .orderCount(stat.getOrderCount())
                        .orderRevenue(stat.getOrderRevenue())
                        .build())
                .collect(Collectors.toList());

        // Summary 계산
        Summary summary = calculateSummary(stats);

        // 상관성 분석
        CorrelationAnalysis correlation = calculateCorrelation(stats);

        return DailyStatisticsResponse.builder()
                .shopId(shopId)
                .statistics(dailyStats)
                .summary(summary)
                .correlationAnalysis(correlation)
                .build();
    }

    /**
     * 요약 통계 계산
     */
    private Summary calculateSummary(List<DailyStatistics> stats) {
        if (stats.isEmpty()) {
            return Summary.builder()
                    .totalFoocketingCount(0)
                    .totalViewCount(0)
                    .totalOrderCount(0)
                    .totalOrderRevenue(0)
                    .averageFoocketingCount(0.0)
                    .averageViewCount(0.0)
                    .averageOrderCount(0.0)
                    .averageOrderRevenue(0.0)
                    .build();
        }

        int totalFoocketing = stats.stream().mapToInt(DailyStatistics::getFoocketingCount).sum();
        int totalView = stats.stream().mapToInt(DailyStatistics::getViewCount).sum();
        int totalOrder = stats.stream().mapToInt(DailyStatistics::getOrderCount).sum();
        int totalRevenue = stats.stream().mapToInt(DailyStatistics::getOrderRevenue).sum();
        
        int size = stats.size();

        return Summary.builder()
                .totalFoocketingCount(totalFoocketing)
                .totalViewCount(totalView)
                .totalOrderCount(totalOrder)
                .totalOrderRevenue(totalRevenue)
                .averageFoocketingCount((double) totalFoocketing / size)
                .averageViewCount((double) totalView / size)
                .averageOrderCount((double) totalOrder / size)
                .averageOrderRevenue((double) totalRevenue / size)
                .build();
    }

    /**
     * 상관성 분석
     */
    private CorrelationAnalysis calculateCorrelation(List<DailyStatistics> stats) {
        if (stats.size() < 2) {
            return CorrelationAnalysis.builder()
                    .foocketingToOrder(null)
                    .viewToOrder(null)
                    .foocketingToView(null)
                    .insights("데이터가 부족하여 상관성 분석을 수행할 수 없습니다.")
                    .build();
        }

        List<Integer> foocketingValues = stats.stream()
                .map(DailyStatistics::getFoocketingCount)
                .collect(Collectors.toList());
        
        List<Integer> viewValues = stats.stream()
                .map(DailyStatistics::getViewCount)
                .collect(Collectors.toList());
        
        List<Integer> orderValues = stats.stream()
                .map(DailyStatistics::getOrderCount)
                .collect(Collectors.toList());

        Double foocketingToOrder = calculatePearsonCorrelation(foocketingValues, orderValues);
        Double viewToOrder = calculatePearsonCorrelation(viewValues, orderValues);
        Double foocketingToView = calculatePearsonCorrelation(foocketingValues, viewValues);

        String insights = generateInsights(foocketingToOrder, viewToOrder, foocketingToView);

        return CorrelationAnalysis.builder()
                .foocketingToOrder(foocketingToOrder)
                .viewToOrder(viewToOrder)
                .foocketingToView(foocketingToView)
                .insights(insights)
                .build();
    }

    /**
     * 피어슨 상관계수 계산
     */
    private Double calculatePearsonCorrelation(List<Integer> x, List<Integer> y) {
        if (x.size() != y.size() || x.size() < 2) {
            return null;
        }

        double meanX = x.stream().mapToInt(Integer::intValue).average().orElse(0);
        double meanY = y.stream().mapToInt(Integer::intValue).average().orElse(0);

        double numerator = 0;
        double sumSqX = 0;
        double sumSqY = 0;

        for (int i = 0; i < x.size(); i++) {
            double diffX = x.get(i) - meanX;
            double diffY = y.get(i) - meanY;
            numerator += diffX * diffY;
            sumSqX += diffX * diffX;
            sumSqY += diffY * diffY;
        }

        double denominator = Math.sqrt(sumSqX * sumSqY);
        return denominator == 0 ? null : numerator / denominator;
    }

    /**
     * 상관성 분석 인사이트 생성
     */
    private String generateInsights(Double foocketingToOrder, Double viewToOrder, Double foocketingToView) {
        StringBuilder insights = new StringBuilder();

        if (foocketingToOrder != null) {
            if (foocketingToOrder > 0.7) {
                insights.append("푸켓팅 참여가 증가할수록 주문량이 크게 증가하는 강한 양의 상관관계가 있습니다. ");
            } else if (foocketingToOrder > 0.3) {
                insights.append("푸켓팅 참여와 주문량 사이에 중간 정도의 양의 상관관계가 있습니다. ");
            } else if (foocketingToOrder < -0.3) {
                insights.append("푸켓팅 참여와 주문량 사이에 음의 상관관계가 있어 주의가 필요합니다. ");
            }
        }

        if (viewToOrder != null) {
            if (viewToOrder > 0.7) {
                insights.append("조회수 증가가 주문량 증가로 이어지는 강한 상관관계가 있습니다. ");
            } else if (viewToOrder > 0.3) {
                insights.append("조회수와 주문량 사이에 중간 정도의 양의 상관관계가 있습니다. ");
            }
        }

        if (insights.length() == 0) {
            insights.append("통계적으로 유의미한 상관관계를 발견하지 못했습니다.");
        }

        return insights.toString();
    }
}

