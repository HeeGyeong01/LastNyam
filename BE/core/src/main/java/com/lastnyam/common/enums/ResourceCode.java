package com.lastnyam.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ResourceCode {

    USER(1), OWNER(2), SHOP(3), MENU(4), CART(5), DISCOUNT(6), FOOCKETING(7),
    TRANSACTION(8), FAVORITE(9), CATEGORY(10), STATISTICS(11), ALERT(12),
    RATING(13), ERROR(127);

    private final int number;
}
