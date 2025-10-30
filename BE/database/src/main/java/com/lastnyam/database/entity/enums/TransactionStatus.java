package com.lastnyam.database.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum TransactionStatus {
    PENDING_APPROVAL("승인 대기"),
    REJECTED("승인 거부"),
    PREPARING_FOOD("음식 준비 중"),
    WAITING_PICKUP("픽업 대기"),
    COMPLETED_PICKUP("픽업 완료"),
    NO_SHOW("노쇼");

    private final String description;
}