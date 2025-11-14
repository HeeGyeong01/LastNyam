package com.lastnyam.customer.discount.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountRecommendationInfo {

    private DiscountBriefInfo discount;
    private boolean visitedShop;
    private boolean purchasedMenu;
}

