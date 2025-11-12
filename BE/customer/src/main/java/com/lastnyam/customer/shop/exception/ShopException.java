package com.lastnyam.customer.shop.exception;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

public class ShopException extends BusinessException {
	public ShopException(BaseErrorCode code) {
		super(code);
	}
}


