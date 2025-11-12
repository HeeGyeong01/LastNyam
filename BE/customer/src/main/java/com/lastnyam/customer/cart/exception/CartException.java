package com.lastnyam.customer.cart.exception;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

public class CartException extends BusinessException {
	public CartException(BaseErrorCode code) {
		super(code);
	}
}


