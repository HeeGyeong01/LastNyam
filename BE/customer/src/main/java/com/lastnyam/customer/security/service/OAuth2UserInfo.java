package com.lastnyam.customer.security.service;

import java.util.Map;

/**
 * OAuth2 제공자로부터 받은 사용자 정보를 추상화하는 인터페이스
 */
public interface OAuth2UserInfo {

    /**
     * OAuth2 제공자 (kakao, google 등)
     */
    String getProvider();

    /**
     * OAuth2 제공자에서 제공하는 사용자 고유 ID
     */
    String getProviderId();

    /**
     * 사용자 이메일
     */
    String getEmail();

    /**
     * 사용자 닉네임
     */
    String getNickname();

    /**
     * 사용자 프로필 이미지 URL
     */
    String getProfileImage();

    /**
     * OAuth2 제공자로부터 받은 원본 attributes
     */
    Map<String, Object> getAttributes();
}

