package com.lastnyam.customer.exception;

import com.lastnyam.common.exception.BusinessException;
import com.lastnyam.common.exception.code.BaseErrorCode;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(BaseErrorCode code) {
        super(code);
    }

    public static ResourceNotFoundException ofUser() {
        return new ResourceNotFoundException(CustomerErrorCode.USER_NOT_FOUND);
    }

    public static ResourceNotFoundException ofOwner() {
        return new ResourceNotFoundException(CustomerErrorCode.OWNER_NOT_FOUND);
    }

    public static ResourceNotFoundException ofShop() {
        return new ResourceNotFoundException(CustomerErrorCode.SHOP_NOT_FOUND);
    }

    public static ResourceNotFoundException ofMenu() {
        return new ResourceNotFoundException(CustomerErrorCode.MENU_NOT_FOUND);
    }

    public static ResourceNotFoundException ofCart() {
        return new ResourceNotFoundException(CustomerErrorCode.CART_NOT_FOUND);
    }

    public static ResourceNotFoundException ofDiscount() {
        return new ResourceNotFoundException(CustomerErrorCode.DISCOUNT_NOT_FOUND);
    }

    public static ResourceNotFoundException ofFoocketing() {
        return new ResourceNotFoundException(CustomerErrorCode.FOOCKETING_NOT_FOUND);
    }

    public static ResourceNotFoundException ofTransaction() {
        return new ResourceNotFoundException(CustomerErrorCode.TRANSACTION_NOT_FOUND);
    }

    public static ResourceNotFoundException ofFavorite() {
        return new ResourceNotFoundException(CustomerErrorCode.FAVORITE_NOT_FOUND);
    }

    public static ResourceNotFoundException ofCategory() {
        return new ResourceNotFoundException(CustomerErrorCode.CATEGORY_NOT_FOUND);
    }

    public static ResourceNotFoundException ofStatistics() {
        return new ResourceNotFoundException(CustomerErrorCode.STATISTICS_NOT_FOUND);
    }

    public static ResourceNotFoundException ofAlert() {
        return new ResourceNotFoundException(CustomerErrorCode.ALERT_NOT_FOUND);
    }

    public static ResourceNotFoundException ofRating() {
        return new ResourceNotFoundException(CustomerErrorCode.RATING_NOT_FOUND);
    }
}
