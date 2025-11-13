package com.lastnyam.customer.shop.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopFoocketingItemDto {

    private Integer foocketingId;
    private LocalDateTime openTime;
    private String menuName;
    private String menuImage;
    private Integer originalPrice;
    private Integer price;
}



