package com.lastnyam.customer.exception;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

public class BadRequestException extends BusinessException {
    public BadRequestException(BaseErrorCode code) {
        super(code);
    }

    public static BadRequestException ofCategory(String message) {
        return new BadRequestException(new BaseErrorCode() {
            @Override
            public org.springframework.http.HttpStatus getStatus() {
                return org.springframework.http.HttpStatus.BAD_REQUEST;
            }

            @Override
            public int getCode() {
                return 400;
            }

            @Override
            public String getMessage() {
                return message;
            }
        });
    }

    public static BadRequestException ofQuery() {
        return new BadRequestException(CustomerErrorCode.INVALID_QUERY);
    }

    public static BadRequestException ofQuery(String message) {
        return new BadRequestException(new BaseErrorCode() {
            @Override
            public org.springframework.http.HttpStatus getStatus() {
                return org.springframework.http.HttpStatus.BAD_REQUEST;
            }

            @Override
            public int getCode() {
                return 400;
            }

            @Override
            public String getMessage() {
                return message;
            }
        });
    }

    public static BadRequestException ofInput() {
        return new BadRequestException(CustomerErrorCode.INVALID_INPUT);
    }

    public static BadRequestException ofInput(String message) {
        return new BadRequestException(new BaseErrorCode() {
            @Override
            public org.springframework.http.HttpStatus getStatus() {
                return org.springframework.http.HttpStatus.BAD_REQUEST;
            }

            @Override
            public int getCode() {
                return 400;
            }

            @Override
            public String getMessage() {
                return message;
            }
        });
    }

    public static BadRequestException ofCategory() {
        return new BadRequestException(CustomerErrorCode.INVALID_CATEGORY);
    }
}