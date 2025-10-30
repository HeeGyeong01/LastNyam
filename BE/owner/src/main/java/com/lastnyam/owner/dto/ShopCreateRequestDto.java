package com.lastnyam.owner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopCreateRequestDto {
    private String shopName;
    private Double shopLat;
    private Double shopLng;
    private String shopDescription;
    private String shopBanner;
    private LocalTime shopCloses;
    private LocalTime shopPickupEndTime;
    private String category;
}
