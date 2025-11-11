package com.lastnyam.customer.exception;

import org.springframework.http.HttpStatus;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

public class NoAuthorityException extends BusinessException {
    public NoAuthorityException(BaseErrorCode code) {
        super(code);
    }

    private static BaseErrorCode forbidden(String message) {
        return new BaseErrorCode() {
            @Override
            public HttpStatus getStatus() {
                return HttpStatus.FORBIDDEN;
            }

            @Override
            public int getCode() {
                return 403;
            }

            @Override
            public String getMessage() {
                return message;
            }
        };
    }

    public static NoAuthorityException ofUser() {
        return new NoAuthorityException(forbidden("해당 사용자에 접근할 권한이 없습니다."));
    }

    public static NoAuthorityException ofShop() {
        return new NoAuthorityException(forbidden("해당 상점에 접근할 권한이 없습니다."));
    }

    public static NoAuthorityException ofMenu() {
        return new NoAuthorityException(forbidden("해당 메뉴에 접근할 권한이 없습니다."));
    }

    public static NoAuthorityException ofDiscount() {
        return new NoAuthorityException(forbidden("해당 마감세일에 접근할 권한이 없습니다."));
    }

    public static NoAuthorityException ofFoocketing() {
        return new NoAuthorityException(forbidden("해당 푸켓팅에 접근할 권한이 없습니다."));
    }

    public static NoAuthorityException ofTransaction() {
        return new NoAuthorityException(forbidden("해당 거래에 접근할 권한이 없습니다."));
    }
}
