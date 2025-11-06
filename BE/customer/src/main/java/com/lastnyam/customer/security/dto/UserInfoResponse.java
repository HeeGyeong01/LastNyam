package com.lastnyam.customer.security.dto;

import com.lastnyam.database.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * 사용자 정보 응답 DTO
 */
@Getter
@Builder
@AllArgsConstructor
public class UserInfoResponse {
    private Integer userId;
    private String email;
    private String nickname;
    private String profileImage;
    private String role;

    public static UserInfoResponse from(User user) {
        return UserInfoResponse.builder()
                .userId(user.getUserId())
                .email(user.getUserEmail())
                .nickname(user.getUserNickname())
                .profileImage(user.getUserProfile())
                .role(user.getUserRole())
                .build();
    }
}
