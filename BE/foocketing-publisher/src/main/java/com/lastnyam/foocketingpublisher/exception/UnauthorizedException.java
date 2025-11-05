package com.lastnyam.foocketingpublisher.exception;

import com.lastnyam.common.exception.BusinessException;

/**
 * 권한이 없는 경우 발생하는 예외
 */
public class UnauthorizedException extends BusinessException {
    
    private static final int UNAUTHORIZED_CODE = 401;

    public UnauthorizedException(String message) {
        super(message, UNAUTHORIZED_CODE);
    }
}

