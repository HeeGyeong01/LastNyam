package com.lastnyam.customer.user.service;

import com.lastnyam.authentication.enums.UserRole;
import com.lastnyam.customer.exception.BadRequestException;
import com.lastnyam.customer.exception.ResourceNotFoundException;
import com.lastnyam.customer.user.dto.UserOnboardingRequestDto;
import com.lastnyam.customer.user.dto.UserOnboardingResponseDto;
import com.lastnyam.customer.user.repository.UserFavoriteRepository;
import com.lastnyam.customer.user.repository.UserRepository;
import com.lastnyam.database.entity.FoodCategory;
import com.lastnyam.database.entity.User;
import com.lastnyam.database.entity.UserFavorite;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserFavoriteRepository userFavoriteRepository;

    @Transactional
    public UserOnboardingResponseDto updateOnboardingProfile(Integer userId, UserOnboardingRequestDto request) {
        // 사용자 존재 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.ofUser());

        // 카테고리 개수 유효성 검증 (1~5개)
        if (request.getCategoryIds() == null || request.getCategoryIds().isEmpty()) {
            throw BadRequestException.ofCategory("최소 1개의 카테고리를 선택해야 합니다.");
        }
        if (request.getCategoryIds().size() > 5) {
            throw BadRequestException.ofCategory("최대 5개의 카테고리만 선택할 수 있습니다.");
        }

        // 새로운 선호 카테고리 저장
        List<UserFavorite> userFavorites = request.getCategoryIds().stream()
                .map(categoryId -> UserFavorite.builder()
                        .user(user)
                        .foodCategory(FoodCategory.builder()
                                .categoryId(categoryId)
                                .build())
                        .build())
                .collect(Collectors.toList());

        userFavoriteRepository.saveAll(userFavorites);

        // 온보딩 완료 시 사용자 역할을 USER로 업그레이드
        if (UserRole.ANONYMOUS.name().equals(user.getUserRole())) {
            userRepository.save(User.builder()
                    .userId(user.getUserId())
                    .userEmail(user.getUserEmail())
                    .userPassword(user.getUserPassword())
                    .userProfile(user.getUserProfile())
                    .userNickname(user.getUserNickname())
                    .userSocialId(user.getUserSocialId())
                    .userRole(UserRole.USER.name())
                    .build());
            log.info("사용자 역할 업그레이드: userId={}, {} -> {}", userId, UserRole.ANONYMOUS, UserRole.USER);
        }

        // 저장된 카테고리 ID 조회
        List<Integer> savedCategoryIds = userFavoriteRepository.findCategoryIdsByUserId(userId);

        return UserOnboardingResponseDto.builder()
                .userId(userId)
                .savedCategoryIds(savedCategoryIds)
                .build();
    }
}
