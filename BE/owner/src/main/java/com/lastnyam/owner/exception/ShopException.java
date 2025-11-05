package com.lastnyam.owner.exception;

import com.lastnyam.common.exception.BusinessException;

public class ShopException extends BusinessException {
    public ShopException(String message, int code) {
        super(message, code);
    }
}
