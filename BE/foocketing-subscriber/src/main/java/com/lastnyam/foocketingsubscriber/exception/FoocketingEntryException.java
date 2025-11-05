package com.lastnyam.foocketingsubscriber.exception;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

public class FoocketingEntryException extends BusinessException {
    public FoocketingEntryException(BaseErrorCode code) {
        super(code);
    }
}
