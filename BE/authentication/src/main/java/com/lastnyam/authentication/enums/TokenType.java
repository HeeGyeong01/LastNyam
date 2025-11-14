package com.lastnyam.authentication.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum TokenType {
    OWNER_REFRESH("owner:refresh:"),
    OWNER_ACCESS("owner:access:"),
    CUSTOMER_REFRESH("customer:refresh:"),
    CUSTOMER_ACCESS("customer:access:");

    private final String prefix;
}
