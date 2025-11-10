package com.lastnyam.common.exception;

import com.lastnyam.common.exception.code.BaseErrorCode;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

	private final BaseErrorCode code;

	public BusinessException(BaseErrorCode code) {
		this.code = code;
	}

	@Override
	public synchronized Throwable fillInStackTrace() {
		return null;
	}
}
