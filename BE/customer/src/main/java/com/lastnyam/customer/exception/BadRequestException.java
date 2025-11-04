package com.lastnyam.customer.exception;

import com.lastnyam.common.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class BadRequestException extends BusinessException {
    public BadRequestException(String message) {
        super(message, HttpStatus.BAD_REQUEST.value());
    }

    public static BadRequestException ofCategory(String message) {
        return new BadRequestException(message);
    }

    public static BadRequestException ofQuery() {
        return new BadRequestException("잘못된 쿼리입니다");
    }

    public static BadRequestException ofQuery(String message) {
        return new BadRequestException(message);
    }

    public static BadRequestException ofInput() {
        return new BadRequestException("잘못된 입력값입니다");
    }

    public static BadRequestException ofInput(String message) {
        return new BadRequestException(message);
    }

}