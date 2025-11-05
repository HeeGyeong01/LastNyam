package com.lastnyam.foocketingpublisher.exception;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

/**
 * 권한이 없는 경우 발생하는 예외
 */
public class FoocketingPublisherException extends BusinessException {
    
    public FoocketingPublisherException(BaseErrorCode code) {
        super(code);
    }
}

