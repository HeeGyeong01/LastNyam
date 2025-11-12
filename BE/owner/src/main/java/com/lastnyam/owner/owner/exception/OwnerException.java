package com.lastnyam.owner.owner.exception;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

public class OwnerException extends BusinessException {
    public OwnerException(BaseErrorCode code) {
        super(code);
    }
}
