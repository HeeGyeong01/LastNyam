package com.lastnyam.owner.shop.exception;

import org.springframework.http.HttpStatus;

import com.lastnyam.common.exception.code.BaseErrorCode;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ShopErrorCode implements BaseErrorCode {

	OWNER_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "점주를 찾을 수 없습니다."),
	SHOP_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "가게를 찾을 수 없습니다."),
	CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "카테고리를 찾을 수 없습니다."),
	NOT_SHOP_OWNER(HttpStatus.FORBIDDEN, 403, "해당 가게의 점주가 아닙니다."),
	MENU_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "메뉴를 찾을 수 없습니다."),
	MENU_NOT_IN_SHOP(HttpStatus.BAD_REQUEST, 400, "해당 가게의 메뉴가 아닙니다.");

	private final HttpStatus status;
	private final int code;
	private final String message;
}
