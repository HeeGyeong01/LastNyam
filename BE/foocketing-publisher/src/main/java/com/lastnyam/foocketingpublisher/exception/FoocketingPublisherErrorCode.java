package com.lastnyam.foocketingpublisher.exception;

import com.lastnyam.common.exception.code.BaseErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum FoocketingPublisherErrorCode implements BaseErrorCode {

    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, 401, "권한이 없습니다."),
    JWT_TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, 401, "JWT 토큰이 없습니다."),
    INVALID_JWT_TOKEN(HttpStatus.UNAUTHORIZED, 401, "유효하지 않은 JWT 토큰입니다."),
    USER_ID_NOT_FOUND_IN_TOKEN(HttpStatus.UNAUTHORIZED, 401, "JWT 토큰에서 userId를 추출할 수 없습니다.");
    
    private final HttpStatus status;
    private final int code;
    private final String message;
}
