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
    
    // 결제 준비 응답 필드
    private String tid; // 결제 고유 번호
    private String partnerOrderId; // 가맹점 주문번호 (결제 승인 시 필요)
    private String nextRedirectAppUrl; // 모바일 앱 redirect URL
    private String nextRedirectMobileUrl; // 모바일 웹 redirect URL
    private String nextRedirectPcUrl; // PC 웹 redirect URL
    
    // 결제 승인 응답 필드
    private String aid; // 요청 고유 번호
    private String approvedAt; // 결제 승인 시각
}

