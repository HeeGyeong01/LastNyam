package com.lastnyam.owner.foocketing.exception;

import com.lastnyam.common.exception.code.BaseErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum FoocketingErrorCode implements BaseErrorCode {

    FOOCKETING_NOT_FOUND(HttpStatus.NOT_FOUND, 404, "해당 푸켓팅을 찾을 수 없습니다."),
    PICKUP_TIME_PASSED(HttpStatus.BAD_REQUEST, 400, "픽업 마감 시간이 지나 푸켓팅을 등록할 수 없습니다."),
    INVALID_FOOCKETING_TIME(HttpStatus.BAD_REQUEST, 400, "푸켓팅 시간은 현재 시간 이후여야 합니다."),
    FOOCKETING_TIME_AFTER_PICKUP_END(HttpStatus.BAD_REQUEST, 400, "푸켓팅 시간은 픽업 마감 시간 이전이어야 합니다.");

    private final HttpStatus status;
    private final int code;
    private final String message;
}
