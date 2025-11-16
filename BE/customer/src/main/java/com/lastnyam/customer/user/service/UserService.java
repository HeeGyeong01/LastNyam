package com.lastnyam.customer.user.service;

import com.lastnyam.authentication.enums.UserRole;
import com.lastnyam.authentication.provider.JwtProvider;
import com.lastnyam.customer.exception.BadRequestException;
import com.lastnyam.customer.exception.ResourceNotFoundException;
import com.lastnyam.customer.user.dto.CursorResponse;
import com.lastnyam.customer.user.dto.FavoriteShopInfo;
import com.lastnyam.customer.user.dto.UserOnboardingRequestDto;
import com.lastnyam.customer.user.dto.UserOnboardingResponseDto;
import com.lastnyam.customer.user.repository.FavoriteQueryRepository;
import com.lastnyam.customer.user.repository.UserFavoriteRepository;
import com.lastnyam.customer.user.repository.UserRepository;
import com.lastnyam.database.entity.FoodCategory;
import com.lastnyam.database.entity.User;
import com.lastnyam.database.entity.UserFavorite;
import com.lastnyam.redis.service.RedisService;
import jakarta.persistence.EntityManager;
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

    private static final String VERSION_KEY_PREFIX = "token_version:customer:";

    private final UserRepository userRepository;
    private final UserFavoriteRepository userFavoriteRepository;
    private final EntityManager entityManager;
    private final FavoriteQueryRepository queryRepository;
    private final JwtProvider jwtProvider;
    private final RedisService redisService;

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

        // 카테고리 존재 여부 검증 및 새로운 선호 카테고리 저장
        List<UserFavorite> userFavorites = request.getCategoryIds().stream()
                .map(categoryId -> {
                    // FoodCategory 실제 조회 (존재 여부 확인)
                    FoodCategory foodCategory = entityManager.find(FoodCategory.class, categoryId);
                    if (foodCategory == null) {
                        throw BadRequestException.ofCategory(
                                String.format("존재하지 않는 카테고리 ID입니다: %d", categoryId));
                    }

                    return UserFavorite.builder()
                            .user(user)
                            .foodCategory(foodCategory)
                            .build();
                })
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

        // 업데이트된 사용자 정보 조회 (역할이 USER로 업그레이드되었을 수 있음)
        User updatedUser = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.ofUser());

        // JWT 토큰 생성
        UserRole userRole = UserRole.valueOf(updatedUser.getUserRole());
        Long tokenVersion = initializeTokenVersion(userId);

        String accessToken = jwtProvider.generateAccessToken(
                userRole,
                userId,
                tokenVersion.toString());
        String refreshToken = jwtProvider.generateRefreshToken(
                userRole,
                userId,
                tokenVersion.toString());

        log.info("온보딩 완료 및 토큰 생성: userId={}, role={}, version={}", userId, userRole, tokenVersion);

        return UserOnboardingResponseDto.builder()
                .userId(userId)
                .savedCategoryIds(savedCategoryIds)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * 사용자별 토큰 버전 초기화
     * Redis에 버전이 없으면 1로 초기화, 있으면 기존 값 유지
     */
    private Long initializeTokenVersion(Integer userId) {
        String versionKey = VERSION_KEY_PREFIX + userId;
        Object storedVersion = redisService.get(versionKey);

        if (storedVersion == null) {
            // 첫 로그인: 버전 1로 초기화
            redisService.add(versionKey, 1L);
            log.debug("토큰 버전 초기화: userId={}, version=1", userId);
            return 1L;
        } else {
            // 이미 버전이 있으면 기존 값 사용 (재발급된 경우)
            try {
                return Long.parseLong(storedVersion.toString());
            } catch (NumberFormatException e) {
                log.error("버전 파싱 실패, 1로 초기화: userId={}", userId);
                redisService.add(versionKey, 1L);
                return 1L;
            }
        }
    }

    /**
     * 사용자가 찜한 가게 목록 조회
     *
     * @param userId 사용자 ID
     * @param lat    위도
     * @param lng    경도
     * @param cursor 커서 (페이징용)
     * @return 찜한 가게 목록 (커서 기반 페이징)
     */
    @Transactional(readOnly = true)
    public CursorResponse<FavoriteShopInfo> getFavoriteShops(Integer userId, Double lat, Double lng,
            String cursor) {
        // 사용자 존재 확인
        userRepository.findById(userId)
                .orElseThrow(ResourceNotFoundException::ofUser);

        return queryRepository.findFavoriteShop(userId, lat, lng, cursor);
    }
}
