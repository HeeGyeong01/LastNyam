package com.lastnyam.customer.cart.exception;

import org.springframework.http.HttpStatus;

import com.lastnyam.common.exception.code.BaseErrorCode;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum CartErrorCode implements BaseErrorCode {

	CART_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "CART_NOT_FOUND"),
	DISCOUNT_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "DISCOUNT_NOT_FOUND"),
	CART_ITEM_NOT_FOUND(HttpStatus.BAD_REQUEST, 400, "CART_ITEM_NOT_FOUND"),
	INVALID_ITEM_QUANTITY(HttpStatus.BAD_REQUEST, 400, "INVALID_ITEM_QUANTITY"),
	CART_EMPTY(HttpStatus.BAD_REQUEST, 400, "CART_EMPTY"),
	DIFFERENT_SHOP_ITEMS(HttpStatus.BAD_REQUEST, 400, "DIFFERENT_SHOP_ITEMS"),
	EXCEEDS_DISCOUNT_AMOUNT(HttpStatus.BAD_REQUEST, 400, "EXCEEDS_DISCOUNT_AMOUNT");
	

	private final HttpStatus status;
	private final int code;
	private final String message;
}


