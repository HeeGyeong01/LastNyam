package com.lastnyam.customer.exception;

import org.springframework.http.HttpStatus;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

public class InternalServerException extends BusinessException {
    public InternalServerException(BaseErrorCode code) {
        super(code);
    }

    private static BaseErrorCode internal(String message) {
        return new BaseErrorCode() {
            @Override
            public HttpStatus getStatus() {
                return HttpStatus.INTERNAL_SERVER_ERROR;
            }

            @Override
            public int getCode() {
                return 500;
            }

            @Override
            public String getMessage() {
                return message;
            }
        };
    }

    public static InternalServerException ofTransaction() {
        return new InternalServerException(internal("거래 처리중 오류가 발생하였습니다."));
    }

    public static InternalServerException ofTransaction(String message) {
        return new InternalServerException(internal(message));
    }

    public static InternalServerException ofDiscount() {
        return new InternalServerException(internal("할인 처리중 오류가 발생하였습니다."));
    }

    public static InternalServerException ofFoocketing() {
        return new InternalServerException(internal("푸켓팅 처리중 오류가 발생하였습니다."));
    }

    public static InternalServerException ofShop() {
        return new InternalServerException(internal("상점 처리중 오류가 발생하였습니다."));
    }

    public static InternalServerException ofStatistics() {
        return new InternalServerException(internal("통계 처리중 오류가 발생하였습니다."));
    }

    public static InternalServerException ofUnknown() {
        return new InternalServerException(internal("알 수 없는 오류가 발생하였습니다."));
    }
}
