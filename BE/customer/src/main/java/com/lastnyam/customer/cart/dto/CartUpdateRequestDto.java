package com.lastnyam.customer.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartUpdateRequestDto {
    private Integer cartItemId;
    private Integer cartItemAmount;
}

