package com.lastnyam.customer.exception;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

public class NoAuthorityException extends BusinessException {

    public NoAuthorityException(BaseErrorCode code) {
        super(code);
    }

    public static NoAuthorityException ofUser() {
        return new NoAuthorityException(CustomerErrorCode.USER_NO_AUTHORITY);
    }

    public static NoAuthorityException ofShop() {
        return new NoAuthorityException(CustomerErrorCode.SHOP_NO_AUTHORITY);
    }

    public static NoAuthorityException ofMenu() {
        return new NoAuthorityException(CustomerErrorCode.MENU_NO_AUTHORITY);
    }

    public static NoAuthorityException ofDiscount() {
        return new NoAuthorityException(CustomerErrorCode.DISCOUNT_NO_AUTHORITY);
    }

    public static NoAuthorityException ofFoocketing() {
        return new NoAuthorityException(CustomerErrorCode.FOOCKETING_NO_AUTHORITY);
    }

    public static NoAuthorityException ofTransaction() {
        return new NoAuthorityException(CustomerErrorCode.TRANSACTION_NO_AUTHORITY);
    }
}
