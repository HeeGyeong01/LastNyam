package com.lastnyam.owner.owner.exception;

import com.lastnyam.common.exception.code.BaseErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum OwnerErrorCode implements BaseErrorCode {

    EMAIL_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, 400, "이미 존재하는 이메일입니다."),
    OWNER_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "점주를 찾을 수 없습니다.");

    private final HttpStatus status;
    private final int code;
    private final String message;
}
