package com.lastnyam.owner.foocketing.exception;

import com.lastnyam.common.exception.code.BaseErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum FoocketingErrorCode implements BaseErrorCode {

    FOOCKETING_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "해당 푸켓팅을 찾을 수 없습니다.");

    private final HttpStatus status;
    private final int code;
    private final String message;
}
