package com.lastnyam.owner.transaction.exception;

import com.lastnyam.common.exception.code.BaseErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum TransactionErrorCode implements BaseErrorCode {

    INVALID_TRANSACTION_TYPE(HttpStatus.BAD_REQUEST, 400, "유효하지 않은 주문 타입입니다."),
    TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "거래를 찾을 수 없습니다.");

    private final HttpStatus status;
    private final int code;
    private final String message;
}
