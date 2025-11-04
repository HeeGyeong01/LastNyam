package com.lastnyam.customer.exception;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.enums.ResourceCode;
import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BusinessException {
    public ResourceNotFoundException(String message, ResourceCode resourceCode) {
        super(message, HttpStatus.NOT_FOUND.value());
    }

    public static ResourceNotFoundException ofUser() {
        return new ResourceNotFoundException("존재하지 않는 사용자입니다.", ResourceCode.USER);
    }

    public static ResourceNotFoundException ofOwner() {
        return new ResourceNotFoundException("존재하지 않는 점주입니다.", ResourceCode.OWNER);
    }

    public static ResourceNotFoundException ofShop() {
        return new ResourceNotFoundException("존재하지 않는 상점입니다.", ResourceCode.SHOP);
    }

    public static ResourceNotFoundException ofMenu() {
        return new ResourceNotFoundException("존재하지 않는 메뉴입니다.", ResourceCode.MENU);
    }

    public static ResourceNotFoundException ofCart() {
        return new ResourceNotFoundException("존재하지 않는 장바구니입니다.", ResourceCode.CART);
    }

    public static ResourceNotFoundException ofDiscount() {
        return new ResourceNotFoundException("존재하지 않는 할인 상품입니다.", ResourceCode.DISCOUNT);
    }

    public static ResourceNotFoundException ofFoocketing() {
        return new ResourceNotFoundException("존재하지 않는 푸켓팅입니다.", ResourceCode.FOOCKETING);
    }

    public static ResourceNotFoundException ofTransaction() {
        return new ResourceNotFoundException("존재하지 않는 거래입니다.", ResourceCode.TRANSACTION);
    }

    public static ResourceNotFoundException ofFavorite() {
        return new ResourceNotFoundException("존재하지 않는 즐겨찾기입니다.", ResourceCode.FAVORITE);
    }

    public static ResourceNotFoundException ofCategory() {
        return new ResourceNotFoundException("존재하지 않는 카테고리입니다.", ResourceCode.CATEGORY);
    }

    public static ResourceNotFoundException ofStatistics() {
        return new ResourceNotFoundException("존재하지 않는 통계 데이터입니다.", ResourceCode.STATISTICS);
    }

    public static ResourceNotFoundException ofAlert() {
        return new ResourceNotFoundException("존재하지 않는 알림입니다.", ResourceCode.ALERT);
    }

    public static ResourceNotFoundException ofRating() {
        return new ResourceNotFoundException("존재하지 않는 평점입니다.", ResourceCode.RATING);
    }
}
