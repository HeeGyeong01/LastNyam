package com.lastnyam.owner.report.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStatisticsResponse {

    private Integer shopId;
    
    @Builder.Default
    private List<DailyStat> statistics = new ArrayList<>();
    
    private Summary summary;
    
    private CorrelationAnalysis correlationAnalysis;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyStat {
        private LocalDate date;
        private Integer foocketingCount;
        private Integer viewCount;
        private Integer orderCount;
        private Integer orderRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Integer totalFoocketingCount;
        private Integer totalViewCount;
        private Integer totalOrderCount;
        private Integer totalOrderRevenue;
        private Double averageFoocketingCount;
        private Double averageViewCount;
        private Double averageOrderCount;
        private Double averageOrderRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CorrelationAnalysis {
        private Double foocketingToOrder;  // 푸켓팅-주문 상관계수
        private Double viewToOrder;         // 조회-주문 상관계수
        private Double foocketingToView;    // 푸켓팅-조회 상관계수
        private String insights;            // 상관성 분석 인사이트
    }
}

