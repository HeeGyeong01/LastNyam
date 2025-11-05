package com.lastnyam.owner.transaction.exception;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

public class TransactionException extends BusinessException {
    public TransactionException(BaseErrorCode code) {
        super(code);
    }
}
