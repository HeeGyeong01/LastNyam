package com.lastnyam.customer.foocketing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopInfo {
    private String name;
    private Double lat;
    private Double lng;
    private Double distance;
    private Double rating;
    private Integer ratingCount;
}
