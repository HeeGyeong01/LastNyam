package com.lastnyam.customer.foocketing.exception;

import com.lastnyam.common.exception.code.BaseErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum FoocketingErrorCode implements BaseErrorCode {
    FOOCKETING_INVALID_CURSOR(HttpStatus.BAD_REQUEST, 400, "잘못된 커서입니다.");

    private final HttpStatus status;
    private final int code;
    private final String message;
}


