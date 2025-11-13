package com.lastnyam.customer.discount.exception;

import com.lastnyam.common.exception.BusinessException;

public class DiscountCursorException extends BusinessException {

    public DiscountCursorException() {
        super(DiscountErrorCode.DISCOUNT_INVALID_CURSOR);
    }
}
