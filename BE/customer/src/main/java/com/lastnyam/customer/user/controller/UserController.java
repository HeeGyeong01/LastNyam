package com.lastnyam.customer.user.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.customer.exception.ResourceNotFoundException;
import com.lastnyam.customer.security.dto.UserInfoResponse;
import com.lastnyam.customer.user.dto.UserOnboardingRequestDto;
import com.lastnyam.customer.user.dto.UserOnboardingResponseDto;
import com.lastnyam.customer.user.repository.UserRepository;
import com.lastnyam.customer.user.service.UserService;
import com.lastnyam.database.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    // 추가 정보 입력 -사용자 선호 카테고리 설정 (1~5개 선택)
    @PostMapping("/{userId}/profile/onboarding")
    public ResponseEntity<ApiResponse<UserOnboardingResponseDto>> updateOnboardingProfile(
            @PathVariable("userId") Integer userId,
            @RequestBody UserOnboardingRequestDto request) {
        UserOnboardingResponseDto result = userService.updateOnboardingProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    /**
     * 사용자 정보 조회
     * 특정 사용자의 정보를 반환합니다.
     *
     * @param userId 사용자 ID
     * @return 사용자 정보 (userId, email, nickname, profileImage, role 등)
     */
    @GetMapping("/{userId}/info")
    public ResponseEntity<UserInfoResponse> getUserInfo(@PathVariable("userId") Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.ofUser());

        return ResponseEntity.ok(UserInfoResponse.from(user));
    }

}
