package com.lastnyam.customer.cart.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponseDto {
    private Integer cartId;
    private Integer userId;
    private List<CartItemResponseDto> cartItems;
    private CartShopInfoDto shop;
}

