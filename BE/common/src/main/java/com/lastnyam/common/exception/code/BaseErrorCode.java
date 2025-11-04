package com.lastnyam.common.exception.code;

import org.springframework.http.HttpStatus;

public interface BaseErrorCode {
	HttpStatus getStatus();
	int getCode();
	String getMessage();
}
