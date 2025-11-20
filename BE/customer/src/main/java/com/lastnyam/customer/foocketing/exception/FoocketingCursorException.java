package com.lastnyam.customer.foocketing.exception;

import com.lastnyam.common.exception.BusinessException;

public class FoocketingCursorException extends BusinessException {

    public FoocketingCursorException() {
        super(FoocketingErrorCode.FOOCKETING_INVALID_CURSOR);
    }
}
