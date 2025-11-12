package com.lastnyam.customer.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartAddRequestDto {
    private Integer discountId;
    private Integer cartItemAmount;
}

