package com.lastnyam.owner.discount.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountGetResponse {
    private Integer discountId;
    private LocalDate discountDate;
    private Integer discountRate;
    private Integer discountPrice;
    private Integer discountMenuAmount;
    private LocalDateTime discountCloseTime;
    private LocalDateTime discountPickupEndTime;
    
    // 메뉴 정보
    private Integer menuId;
    private String menuName;
    private Integer menuPrice;
    private String menuImage;
}

