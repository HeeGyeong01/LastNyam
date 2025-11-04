package com.lastnyam.customer.user.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.customer.user.dto.UserOnboardingRequestDto;
import com.lastnyam.customer.user.dto.UserOnboardingResponseDto;
import com.lastnyam.customer.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    // 추가 정보 입력 -사용자 선호 카테고리 설정 (1~5개 선택)
    @PostMapping("/{userId}/profile/onboarding")
    public ResponseEntity<ApiResponse<UserOnboardingResponseDto>> updateOnboardingProfile(
            @PathVariable("userId") Integer userId,
            @RequestBody UserOnboardingRequestDto request) {
        UserOnboardingResponseDto result = userService.updateOnboardingProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

}
