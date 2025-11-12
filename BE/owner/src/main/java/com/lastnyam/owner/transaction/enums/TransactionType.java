package com.lastnyam.owner.transaction.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum TransactionType {
    FOOCKETING("푸켓팅"),
    DISCOUNT("마감세일");

    private final String description;
}
