package com.lastnyam.customer.shop.service;

import com.lastnyam.customer.discount.repository.DiscountRepository;
import com.lastnyam.customer.foocketing.repository.FoocketingRepository;
import com.lastnyam.customer.shop.dto.ShopDetailResponseDto;
import com.lastnyam.customer.shop.dto.ShopDiscountItemDto;
import com.lastnyam.customer.shop.dto.ShopFavoriteResponseDto;
import com.lastnyam.customer.shop.dto.ShopFoocketingItemDto;
import com.lastnyam.customer.shop.exception.ShopErrorCode;
import com.lastnyam.customer.shop.exception.ShopException;
import com.lastnyam.customer.shop.repository.FavoriteRepository;
import com.lastnyam.customer.shop.repository.ShopRatingRepository;
import com.lastnyam.customer.shop.repository.ShopRepository;
import com.lastnyam.customer.user.repository.UserRepository;
import com.lastnyam.database.entity.Discount;
import com.lastnyam.database.entity.Favorite;
import com.lastnyam.database.entity.Foocketing;
import com.lastnyam.database.entity.Shop;
import com.lastnyam.database.entity.ShopRating;
import com.lastnyam.database.entity.User;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final DiscountRepository discountRepository;
    private final FoocketingRepository foocketingRepository;
    private final ShopRatingRepository shopRatingRepository;

    @Transactional(readOnly = true)
    public ShopDetailResponseDto getShopDetail(Integer shopId, Double currentLat, Double currentLng) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ShopException(ShopErrorCode.SHOP_NOT_FOUND));

        // 별점 조회
        ShopRating rating = shopRatingRepository.findByShop_ShopId(shopId).orElse(null);
        int ratingCount = rating != null ? rating.getShopRatingCount() : 0;
        double ratingAvg =
                ratingCount > 0 ? (double) Objects.requireNonNull(rating).getShopRatingSum() / ratingCount : 0.0;

        // 마감세일 (미래만)
        LocalDateTime now = LocalDateTime.now();
        List<Discount> discounts = discountRepository
                .findByMenu_Shop_ShopIdAndDiscountCloseTimeAfter(shopId, now);
        List<ShopDiscountItemDto> discountDtos = discounts.stream()
                .map(d -> ShopDiscountItemDto.builder()
                        .discountId(d.getDiscountId())
                        .menuName(d.getMenu().getMenuName())
                        .originalPrice(d.getMenu().getMenuPrice())
                        .discountRate(d.getDiscountRate())
                        .price(d.getDiscountPrice())
                        .menuImage(d.getMenu().getMenuImage())
                        .menuDescription(d.getMenu().getMenuDescription())
                        .stock(d.getDiscountMenuAmount())
                        .build())
                .collect(Collectors.toList());

        // 푸켓팅 (오픈 중 + 예정)

        int minute = now.getMinute();
        int floored = (minute / 30) * 30;

        LocalDateTime flooredTime = now.withMinute(floored)
                .withSecond(0)
                .withNano(0).minusMinutes(1L);

        List<Foocketing> foocketings = foocketingRepository
                .findByMenu_Shop_ShopIdAndFoocketingTimeAfter(shopId, flooredTime);
        List<ShopFoocketingItemDto> foocketingDtos = foocketings.stream()
                .map(f -> ShopFoocketingItemDto.builder()
                        .foocketingId(f.getFoocketingId())
                        .openTime(f.getFoocketingTime())
                        .menuName(f.getMenu().getMenuName())
                        .originalPrice(f.getMenu().getMenuPrice())
                        .menuImage(f.getMenu().getMenuImage())
                        .price(0) // 별도 가격 필드가 없어 메뉴가로 반환
                        .build())
                .collect(Collectors.toList());

        // 거리 계산 (옵션)
        Double distanceMeters = null;
        if (currentLat != null && currentLng != null) {
            distanceMeters = haversineDistanceMeters(currentLat, currentLng, shop.getShopLat(), shop.getShopLng());
        }

        return ShopDetailResponseDto.builder()
                .shopId(shop.getShopId())
                .shopName(shop.getShopName())
                .shopLat(shop.getShopLat())
                .shopLng(shop.getShopLng())
                .shopAddress(shop.getShopAddress())
                .shopDescription(shop.getShopDescription())
                .shopBanner(shop.getShopBanner())
                .shopCloses(shop.getShopCloses())
                .shopPickupEndTime(shop.getShopPickupEndTime())
                .categoryId(shop.getFoodCategory() != null ? shop.getFoodCategory().getCategoryId() : null)
                .ownerId(shop.getOwner() != null ? shop.getOwner().getOwnerId() : null)
                .rating(ratingAvg)
                .ratingCount(ratingCount)
                .distanceMeters(distanceMeters)
                .discounts(discountDtos)
                .foocketings(foocketingDtos)
                .build();
    }

    @Transactional
    public ShopFavoriteResponseDto addFavorite(Integer shopId, Integer userId) {
        if (favoriteRepository.existsByUserUserIdAndShopShopId(userId, shopId)) {
            throw new ShopException(ShopErrorCode.ALREADY_FAVORITED);
        }

        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ShopException(ShopErrorCode.SHOP_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ShopException(ShopErrorCode.USER_NOT_FOUND));

        Favorite favorite = Favorite.builder()
                .shop(shop)
                .user(user)
                .build();

        favoriteRepository.save(favorite);

        return ShopFavoriteResponseDto.builder()
                .shopId(shopId)
                .userId(userId)
                .favorited(true)
                .build();
    }

    @Transactional
    public ShopFavoriteResponseDto removeFavorite(Integer shopId, Integer userId) {
        Favorite favorite = favoriteRepository.findByUserUserIdAndShopShopId(userId, shopId)
                .orElseThrow(() -> new ShopException(ShopErrorCode.FAVORITE_NOT_FOUND));

        favoriteRepository.delete(favorite);

        return ShopFavoriteResponseDto.builder()
                .shopId(shopId)
                .userId(userId)
                .favorited(false)
                .build();
    }

    private Double haversineDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000.0; // meters
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}


