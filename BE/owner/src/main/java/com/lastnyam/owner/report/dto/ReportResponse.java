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
public class ReportResponse {

    // 날짜 범위
    private LocalDate startDate;
    private LocalDate endDate;

    // 총 판매 개수
    private Integer totalSalesCount;
    private Double totalSalesChangeRate; // 전주 대비 변화율 (%)

    // 총 판매액
    private Integer totalRevenue;
    private Double totalRevenueChangeRate; // 전주 대비 변화율 (%)

    // 푸켓팅 횟수
    private Integer pocketingCount;
    private Double pocketingChangeRate; // 전주 대비 변화율 (%)

    // 방문자수
    private Integer visitorCount;
    private Double visitorChangeRate; // 전주 대비 변화율 (%)

    // 메뉴별 통계
    @Builder.Default
    private List<MenuStats> menuStats = new ArrayList<>();

    // 메뉴 분포 그래프용 (카테고리별 판매 비중)
    @Builder.Default
    private List<MenuDistribution> menuDistribution = new ArrayList<>();

    // AI 추천
    private String advice;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuStats {
        String name;
        String category;
        Integer price;
        Integer soldSum;
        Integer registerSum;
        Integer weeklySold;
        Integer weeklyRegister;
        Integer weeklyFoocketingView;
        Integer weeklyFoocketingEntry;

        @Override
        public String toString() {
            return "- " + name + ", " + price + ", " + soldSum + ", " +
                    registerSum + ", " + weeklySold + ", " + weeklyRegister + ", " +
                    weeklyFoocketingView + ", " + weeklyFoocketingEntry;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuDistribution {
        String category;
        Integer count;
    }
}
