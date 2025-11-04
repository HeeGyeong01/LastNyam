package com.lastnyam.customer.exception;

import com.lastnyam.common.enums.ResourceCode;
import org.springframework.http.HttpStatus;

public class NoAuthorityException extends com.lastnyam.common.exception.BusinessException {
    public NoAuthorityException(String message, ResourceCode resourceCode) {
        super(message, HttpStatus.FORBIDDEN.value());
    }

    public static NoAuthorityException ofUser() {
        return new NoAuthorityException("해당 사용자에 접근할 권한이 없습니다.", ResourceCode.USER);
    }

    public static NoAuthorityException ofShop() {
        return new NoAuthorityException("해당 상점에 접근할 권한이 없습니다.", ResourceCode.SHOP);
    }

    public static NoAuthorityException ofMenu() {
        return new NoAuthorityException("해당 메뉴에 접근할 권한이 없습니다.", ResourceCode.MENU);
    }

    public static NoAuthorityException ofDiscount() {
        return new NoAuthorityException("해당 마감세일에 접근할 권한이 없습니다.", ResourceCode.DISCOUNT);
    }

    public static NoAuthorityException ofFoocketing() {
        return new NoAuthorityException("해당 푸켓팅에 접근할 권한이 없습니다.", ResourceCode.FOOCKETING);
    }

    public static NoAuthorityException ofTransaction() {
        return new NoAuthorityException("해당 거래에 접근할 권한이 없습니다.", ResourceCode.TRANSACTION);
    }
}
