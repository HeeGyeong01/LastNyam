package com.lastnyam.customer.exception;

import com.lastnyam.common.exception.code.BaseErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum CustomerErrorCode implements BaseErrorCode {

    // BadRequestException (400)
    INVALID_CATEGORY(HttpStatus.BAD_REQUEST, 400, "잘못된 카테고리입니다."),
    INVALID_QUERY(HttpStatus.BAD_REQUEST, 400, "잘못된 쿼리입니다."),
    INVALID_INPUT(HttpStatus.BAD_REQUEST, 400, "잘못된 입력값입니다."),

    // ResourceNotFoundException (404)
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 사용자입니다."),
    OWNER_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 점주입니다."),
    SHOP_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 상점입니다."),
    MENU_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 메뉴입니다."),
    CART_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 장바구니입니다."),
    DISCOUNT_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 할인 상품입니다."),
    FOOCKETING_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 푸켓팅입니다."),
    TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 거래입니다."),
    FAVORITE_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 즐겨찾기입니다."),
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 카테고리입니다."),
    STATISTICS_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 통계 데이터입니다."),
    ALERT_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 알림입니다."),
    RATING_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "존재하지 않는 평점입니다."),
 
    // NoAuthorityException (403)
    USER_NO_AUTHORITY(HttpStatus.FORBIDDEN, 403, "해당 사용자에 접근할 권한이 없습니다."),
    SHOP_NO_AUTHORITY(HttpStatus.FORBIDDEN, 403, "해당 상점에 접근할 권한이 없습니다."),
    MENU_NO_AUTHORITY(HttpStatus.FORBIDDEN, 403, "해당 메뉴에 접근할 권한이 없습니다."),
    DISCOUNT_NO_AUTHORITY(HttpStatus.FORBIDDEN, 403, "해당 마감세일에 접근할 권한이 없습니다."),
    FOOCKETING_NO_AUTHORITY(HttpStatus.FORBIDDEN, 403, "해당 푸켓팅에 접근할 권한이 없습니다."),
    TRANSACTION_NO_AUTHORITY(HttpStatus.FORBIDDEN, 403, "해당 거래에 접근할 권한이 없습니다."),

    // InternalServerException (500)
    TRANSACTION_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, 500, "거래 처리중 오류가 발생하였습니다."),
    DISCOUNT_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, 500, "할인 처리중 오류가 발생하였습니다."),
    FOOCKETING_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, 500, "푸켓팅 처리중 오류가 발생하였습니다."),
    SHOP_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, 500, "상점 처리중 오류가 발생하였습니다."),
    STATISTICS_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, 500, "통계 처리중 오류가 발생하였습니다."),
    UNKNOWN_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, 500, "알 수 없는 오류가 발생하였습니다.");

    private final HttpStatus status;
    private final int code;
    private final String message;
}
