package com.lastnyam.owner.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum OrderType {
    FOOCKETING("푸켓팅"),
    DISCOUNT("마감세일");

    private final String description;
}
