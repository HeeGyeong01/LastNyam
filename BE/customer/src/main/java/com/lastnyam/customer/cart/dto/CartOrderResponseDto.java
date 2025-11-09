package com.lastnyam.customer.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartOrderResponseDto {
    private Integer orderId;
    private Integer userId;
    private Integer totalPrice;
    private String paymentStatus;
    // 카카오페이 결제 관련 추가 필드가 필요할 수 있음
}

