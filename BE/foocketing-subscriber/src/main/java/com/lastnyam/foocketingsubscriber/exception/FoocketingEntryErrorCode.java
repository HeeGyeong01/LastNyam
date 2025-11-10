package com.lastnyam.foocketingsubscriber.exception;

import com.lastnyam.common.exception.code.BaseErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum FoocketingEntryErrorCode implements BaseErrorCode {

    FOOCKETING_NOT_FOUND(HttpStatus.BAD_REQUEST, 400, "존재하지 않는 푸켓팅입니다."),
    USER_NOT_FOUND(HttpStatus.BAD_REQUEST, 400, "존재하지 않는 사용자입니다.");

    private final HttpStatus status;
    private final int code;
    private final String message;
}
