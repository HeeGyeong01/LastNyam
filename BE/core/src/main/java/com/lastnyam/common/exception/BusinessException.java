package com.lastnyam.common.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException{

    private final int code;

    public BusinessException(String message, int code){
        super(message);
        this.code = code;
    }

    @Override
    public synchronized Throwable fillInStackTrace() {
        return null;
    }
}
