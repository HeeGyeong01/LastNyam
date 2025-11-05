package com.lastnyam.owner.external.s3.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * S3 파일 타입 정의
 *
 * 각 서비스별로 파일을 저장할 디렉토리 경로를 관리합니다.
 */
@Getter
@RequiredArgsConstructor
public enum S3FileType {

    MENU_IMAGE("menu-image", "메뉴 이미지"),
    SHOP_PROFILE_IMAGE("shop-profile-image", "가게 프로필 이미지");

    /**
     * S3 버킷 내 디렉토리 경로
     */
    private final String path;

    /**
     * 파일 타입 설명
     */
    private final String description;

    /**
     * 전체 경로 생성 (파일명 포함)
     *
     * @param fileName 파일명
     * @return 전체 S3 키
     */
    public String getFullPath(String fileName) {
        return path + "/" + fileName;
    }
}
