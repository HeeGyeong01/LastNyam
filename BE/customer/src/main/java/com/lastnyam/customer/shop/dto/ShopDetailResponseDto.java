package com.lastnyam.customer.shop.dto;

import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopDetailResponseDto {

    private Integer shopId;
    private String shopName;
    private Double shopLat;
    private Double shopLng;
    private String shopAddress;
    private String shopDescription;
    private String shopBanner;
    private LocalTime shopCloses;
    private LocalTime shopPickupEndTime;
    private Integer categoryId;
    private Integer ownerId;
}


