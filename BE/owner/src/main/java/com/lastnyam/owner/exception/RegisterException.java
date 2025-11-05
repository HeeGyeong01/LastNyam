package com.lastnyam.owner.exception;

import com.lastnyam.common.exception.BusinessException;

public class RegisterException extends BusinessException {

    public RegisterException(String message, int code) {
        super(message, code);
    }


}
