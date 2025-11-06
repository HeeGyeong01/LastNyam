package com.lastnyam.owner.discount.exception;

import com.lastnyam.common.exception.code.BaseErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum DiscountErrorCode implements BaseErrorCode {

    DISCOUNT_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "해당 마감세일을 찾을 수 없습니다."),
    PICKUP_TIME_PASSED(HttpStatus.BAD_REQUEST, 400, "픽업 마감 시간이 지나 마감세일을 등록할 수 없습니다."),
    INVALID_DISCOUNT_PRICE(HttpStatus.BAD_REQUEST, 400, "할인 가격은 원래 메뉴 가격보다 저렴해야 합니다.");

    private final HttpStatus status;
    private final int code;
    private final String message;
}
