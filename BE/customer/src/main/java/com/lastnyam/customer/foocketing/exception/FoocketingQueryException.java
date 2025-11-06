package com.lastnyam.customer.foocketing.exception;

import com.lastnyam.common.exception.BusinessException;

public class FoocketingQueryException extends BusinessException {

    public FoocketingQueryException() {
        super("쿼리 요청 중 문제가 발생하였습니다.", 400);
    }
}
