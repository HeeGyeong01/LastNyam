package com.lastnyam.customer.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopFavoriteResponseDto {
    private Integer shopId;
    private Integer userId;
    private boolean favorited;
}


