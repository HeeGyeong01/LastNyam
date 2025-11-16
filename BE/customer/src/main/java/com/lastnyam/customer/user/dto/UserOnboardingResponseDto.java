package com.lastnyam.customer.user.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserOnboardingResponseDto {
    private Integer userId;
    private List<Integer> savedCategoryIds; // 저장된 카테고리 ID 리스트
    private String accessToken;
    private String refreshToken;
}
