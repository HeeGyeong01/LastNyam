package com.lastnyam.owner.discount.exception;

import com.lastnyam.common.exception.code.BaseErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum DiscountErrorCode implements BaseErrorCode {

    SHOP_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "가게를 찾을 수 없습니다."),
    NOT_SHOP_OWNER(HttpStatus.BAD_REQUEST, 400, "해당 가게의 점주가 아닙니다."),
    MENU_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "메뉴를 찾을 수 없습니다."),
    MENU_NOT_IN_SHOP(HttpStatus.BAD_REQUEST, 400, "해당 가게의 메뉴가 아닙니다.");

    private final HttpStatus status;
    private final int code;
    private final String message;
}
