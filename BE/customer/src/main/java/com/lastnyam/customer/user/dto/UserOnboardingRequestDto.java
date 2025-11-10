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
public class UserOnboardingRequestDto {
    private List<Integer> categoryIds; // 선택한 카테고리 ID 리스트 (1~5개)
}
