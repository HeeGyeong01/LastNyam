package com.lastnyam.customer.exception;

import org.springframework.http.HttpStatus;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

public class BadRequestException extends BusinessException {
    public BadRequestException(BaseErrorCode code) {
        super(code);
    }

    private static BaseErrorCode badRequest(String message) {
        return new BaseErrorCode() {
            @Override
            public HttpStatus getStatus() {
                return HttpStatus.BAD_REQUEST;
            }

            @Override
            public int getCode() {
                return 400;
            }

            @Override
            public String getMessage() {
                return message;
            }
        };
    }

    public static BadRequestException ofCategory(String message) {
        return new BadRequestException(badRequest(message));
    }

    public static BadRequestException ofQuery() {
        return new BadRequestException(badRequest("잘못된 쿼리입니다"));
    }

    public static BadRequestException ofQuery(String message) {
        return new BadRequestException(badRequest(message));
    }

    public static BadRequestException ofInput() {
        return new BadRequestException(badRequest("잘못된 입력값입니다"));
    }

    public static BadRequestException ofInput(String message) {
        return new BadRequestException(badRequest(message));
    }
}