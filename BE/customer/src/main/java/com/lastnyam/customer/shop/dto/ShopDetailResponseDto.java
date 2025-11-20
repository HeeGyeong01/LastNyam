package com.lastnyam.customer.shop.dto;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
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

    // 추가 정보
    private Double rating;          // 평균 별점
    private Integer ratingCount;    // 별점 개수
	private Integer favoriteCount;  // 즐겨찾기 개수
	private Boolean favorited;      // 요청 사용자 즐겨찾기 여부 (userId 없으면 null)
    private Double distanceMeters;  // 현재 위치로부터 거리 (미터) - null 허용

    // 하위 컬렉션
	private List<ShopDiscountItemDto> discounts;
    private List<ShopFoocketingItemDto> foocketings;
}


