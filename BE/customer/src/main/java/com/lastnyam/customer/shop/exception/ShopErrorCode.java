package com.lastnyam.customer.shop.exception;

import org.springframework.http.HttpStatus;

import com.lastnyam.common.exception.code.BaseErrorCode;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ShopErrorCode implements BaseErrorCode {
	SHOP_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 상점입니다."),
	USER_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 사용자입니다."),
	FAVORITE_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 즐겨찾기입니다."),
	ALREADY_FAVORITED(HttpStatus.BAD_REQUEST, 400, "이미 찜한 가게입니다.");

	private final HttpStatus status;
	private final int code;
	private final String message;
}


