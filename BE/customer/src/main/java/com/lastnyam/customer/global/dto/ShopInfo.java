package com.lastnyam.customer.global.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ShopInfo {
    private Integer shopId;
    private String bannerUrl;
    private String name;
    private Double lat;
    private Double lng;
    private Double distance;
    private Double rating;
    private Integer ratingCount;
}
