package com.lastnyam.customer.discount.dto;

import com.lastnyam.customer.global.dto.ShopInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountMenu {

    private ShopInfo shopInfo;
    private String menuName;
}
