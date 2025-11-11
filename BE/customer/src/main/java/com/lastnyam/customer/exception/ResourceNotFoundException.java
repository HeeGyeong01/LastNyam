package com.lastnyam.customer.exception;

import org.springframework.http.HttpStatus;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

public class ResourceNotFoundException extends BusinessException {
    public ResourceNotFoundException(BaseErrorCode code) {
        super(code);
    }

    private static BaseErrorCode notFound(String message) {
        return new BaseErrorCode() {
            @Override
            public HttpStatus getStatus() {
                return HttpStatus.NOT_FOUND;
            }

            @Override
            public int getCode() {
                return 404;
            }

            @Override
            public String getMessage() {
                return message;
            }
        };
    }

    public static ResourceNotFoundException ofUser() {
        return new ResourceNotFoundException(notFound("존재하지 않는 사용자입니다."));
    }

    public static ResourceNotFoundException ofOwner() {
        return new ResourceNotFoundException(notFound("존재하지 않는 점주입니다."));
    }

    public static ResourceNotFoundException ofShop() {
        return new ResourceNotFoundException(notFound("존재하지 않는 상점입니다."));
    }

    public static ResourceNotFoundException ofMenu() {
        return new ResourceNotFoundException(notFound("존재하지 않는 메뉴입니다."));
    }

    public static ResourceNotFoundException ofCart() {
        return new ResourceNotFoundException(notFound("존재하지 않는 장바구니입니다."));
    }

    public static ResourceNotFoundException ofDiscount() {
        return new ResourceNotFoundException(notFound("존재하지 않는 할인 상품입니다."));
    }

    public static ResourceNotFoundException ofFoocketing() {
        return new ResourceNotFoundException(notFound("존재하지 않는 푸켓팅입니다."));
    }

    public static ResourceNotFoundException ofTransaction() {
        return new ResourceNotFoundException(notFound("존재하지 않는 거래입니다."));
    }

    public static ResourceNotFoundException ofFavorite() {
        return new ResourceNotFoundException(notFound("존재하지 않는 즐겨찾기입니다."));
    }

    public static ResourceNotFoundException ofCategory() {
        return new ResourceNotFoundException(notFound("존재하지 않는 카테고리입니다."));
    }

    public static ResourceNotFoundException ofStatistics() {
        return new ResourceNotFoundException(notFound("존재하지 않는 통계 데이터입니다."));
    }

    public static ResourceNotFoundException ofAlert() {
        return new ResourceNotFoundException(notFound("존재하지 않는 알림입니다."));
    }

    public static ResourceNotFoundException ofRating() {
        return new ResourceNotFoundException(notFound("존재하지 않는 평점입니다."));
    }
}
