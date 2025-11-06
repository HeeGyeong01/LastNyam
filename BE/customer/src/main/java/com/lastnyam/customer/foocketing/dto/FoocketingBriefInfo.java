package com.lastnyam.customer.foocketing.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingBriefInfo {

    private Integer foocketingId;
    private LocalDateTime openTime;
    private MenuInfo menu;
    private ShopInfo shop;


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuInfo {
        private String name;
        private Integer price;
        private String photoUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShopInfo {
        private String name;
        private Double lat;
        private Double lng;
        private Double distance;
        private Double rating;
        private Integer ratingCount;
    }
}
