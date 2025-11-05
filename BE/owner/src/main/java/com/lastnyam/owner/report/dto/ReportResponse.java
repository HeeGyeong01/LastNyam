package com.lastnyam.owner.report.dto;

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

    @Builder.Default
    private List<MenuStats> menuStats = new ArrayList<>();
    private String advice;
    private Integer totalIncome;
    private Integer increasedViews;
    private Integer increasedFavorites;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuStats {
        String name;
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


}
