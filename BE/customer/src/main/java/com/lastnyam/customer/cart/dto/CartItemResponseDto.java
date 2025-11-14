package com.lastnyam.customer.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponseDto {
    private Integer cartItemId;
    private Integer discountId;
    private Integer cartItemAmount;
    private String menuName;
    private Integer discountPrice;
    private Integer discountRate;
    private String menuImage;
    private Integer discountMenuAmount;
}

