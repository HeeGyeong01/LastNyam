package com.lastnyam.foocketingsubscriber.exception;

import com.lastnyam.common.exception.BusinessException;

public class FoocketingEntryException extends BusinessException {

    public FoocketingEntryException(String message, int code) {
        super(message, code);
    }
}
