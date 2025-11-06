package com.lastnyam.owner.discount.exception;

import com.lastnyam.common.exception.code.BaseErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum DiscountErrorCode implements BaseErrorCode {

    DISCOUNT_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "해당 마감세일을 찾을 수 없습니다.");

    private final HttpStatus status;
    private final int code;
    private final String message;
}
