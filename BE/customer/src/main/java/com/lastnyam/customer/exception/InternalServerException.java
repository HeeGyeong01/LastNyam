package com.lastnyam.customer.exception;

import com.lastnyam.common.enums.ResourceCode;
import org.springframework.http.HttpStatus;

public class InternalServerException extends com.lastnyam.common.exception.BusinessException {
    public InternalServerException(String message, ResourceCode resourceCode) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR.value());
    }

    public static InternalServerException ofTransaction() {
        return new InternalServerException("거래 처리중 오류가 발생하였습니다.", ResourceCode.TRANSACTION);
    }

    public static InternalServerException ofTransaction(String message) {
        return new InternalServerException(message, ResourceCode.TRANSACTION);
    }

    public static InternalServerException ofDiscount() {
        return new InternalServerException("할인 처리중 오류가 발생하였습니다.", ResourceCode.DISCOUNT);
    }

    public static InternalServerException ofFoocketing() {
        return new InternalServerException("푸켓팅 처리중 오류가 발생하였습니다.", ResourceCode.FOOCKETING);
    }

    public static InternalServerException ofShop() {
        return new InternalServerException("상점 처리중 오류가 발생하였습니다.", ResourceCode.SHOP);
    }

    public static InternalServerException ofStatistics() {
        return new InternalServerException("통계 처리중 오류가 발생하였습니다.", ResourceCode.STATISTICS);
    }

    public static InternalServerException ofUnknown() {
        return new InternalServerException("알 수 없는 오류가 발생하였습니다.", ResourceCode.ERROR);
    }
}
