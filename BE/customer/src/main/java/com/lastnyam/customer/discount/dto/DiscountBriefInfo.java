package com.lastnyam.customer.discount.dto;

import com.lastnyam.customer.global.dto.MenuInfo;
import com.lastnyam.customer.global.dto.ShopInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountBriefInfo {

    Integer discountId;
    Integer discountAmount;
    Integer discountRate;
    Integer discountPrice;

    private MenuInfo menuInfo;
    private ShopInfo shopInfo;
}
