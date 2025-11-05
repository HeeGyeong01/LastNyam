package com.lastnyam.owner.discount.exception;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

public class DiscountException extends BusinessException {
    public DiscountException(BaseErrorCode code) {
        super(code);
    }
}
