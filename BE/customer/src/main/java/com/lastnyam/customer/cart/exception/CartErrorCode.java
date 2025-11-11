package com.lastnyam.customer.cart.exception;

import org.springframework.http.HttpStatus;

import com.lastnyam.common.exception.code.BaseErrorCode;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum CartErrorCode implements BaseErrorCode {

	CART_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 장바구니입니다."),
	DISCOUNT_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 할인 상품입니다."),
	CART_ITEM_NOT_FOUND(HttpStatus.BAD_REQUEST, 400, "장바구니에 해당 아이템이 없습니다."),
	INVALID_ITEM_QUANTITY(HttpStatus.BAD_REQUEST, 400, "물품 개수는 1개 이상이어야 합니다."),
	CART_EMPTY(HttpStatus.BAD_REQUEST, 400, "장바구니가 비어있습니다."),
	DIFFERENT_SHOP_ITEMS(HttpStatus.BAD_REQUEST, 400, "이미 장바구니에 다른 가게의 물품이 있습니다. 한 번에 하나의 가게의 물품만 담을 수 있습니다.");

	private final HttpStatus status;
	private final int code;
	private final String message;
}


