package com.lastnyam.customer.foocketing.exception;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

public class FoocketingException extends BusinessException {

    public FoocketingException(BaseErrorCode code) {
        super(code);
    }
}
