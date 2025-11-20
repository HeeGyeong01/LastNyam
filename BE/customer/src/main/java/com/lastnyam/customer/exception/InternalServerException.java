package com.lastnyam.customer.exception;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

public class InternalServerException extends BusinessException {

    public InternalServerException(BaseErrorCode code) {
        super(code);
    }

    public static InternalServerException ofTransaction() {
        return new InternalServerException(CustomerErrorCode.TRANSACTION_ERROR);
    }

    public static InternalServerException ofTransaction(String message) {
        return new InternalServerException(new BaseErrorCode() {
            @Override
            public org.springframework.http.HttpStatus getStatus() {
                return org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
            }

            @Override
            public int getCode() {
                return 500;
            }

            @Override
            public String getMessage() {
                return message;
            }
        });
    }

    public static InternalServerException ofDiscount() {
        return new InternalServerException(CustomerErrorCode.DISCOUNT_ERROR);
    }

    public static InternalServerException ofFoocketing() {
        return new InternalServerException(CustomerErrorCode.FOOCKETING_ERROR);
    }

    public static InternalServerException ofShop() {
        return new InternalServerException(CustomerErrorCode.SHOP_ERROR);
    }

    public static InternalServerException ofStatistics() {
        return new InternalServerException(CustomerErrorCode.STATISTICS_ERROR);
    }

    public static InternalServerException ofUnknown() {
        return new InternalServerException(CustomerErrorCode.UNKNOWN_ERROR);
    }
}
