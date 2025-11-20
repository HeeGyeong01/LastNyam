package com.lastnyam.customer.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartOrderApproveRequestDto {
    private String tid; // 결제 고유 번호
    private String pgToken; // 결제 승인 토큰
    private String partnerOrderId; // 가맹점 주문번호
}

