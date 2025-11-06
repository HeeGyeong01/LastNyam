package com.lastnyam.customer.shop.service;

import com.lastnyam.customer.exception.BadRequestException;
import com.lastnyam.customer.exception.ResourceNotFoundException;
import com.lastnyam.customer.shop.dto.ShopDetailResponseDto;
import com.lastnyam.customer.shop.dto.ShopFavoriteResponseDto;
import com.lastnyam.customer.shop.repository.FavoriteRepository;
import com.lastnyam.customer.shop.repository.ShopRepository;
import com.lastnyam.customer.user.repository.UserRepository;
import com.lastnyam.database.entity.Favorite;
import com.lastnyam.database.entity.Shop;
import com.lastnyam.database.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ShopDetailResponseDto getShopDetail(Integer shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(ResourceNotFoundException::ofShop);

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
                .build();
    }

    @Transactional
    public ShopFavoriteResponseDto addFavorite(Integer shopId, Integer userId) {
        if (favoriteRepository.existsByUserUserIdAndShopShopId(userId, shopId)) {
            throw BadRequestException.ofInput("이미 찜한 가게입니다.");
        }

        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(ResourceNotFoundException::ofShop);
        User user = userRepository.findById(userId)
                .orElseThrow(ResourceNotFoundException::ofUser);

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
                .orElseThrow(ResourceNotFoundException::ofFavorite);

        favoriteRepository.delete(favorite);

        return ShopFavoriteResponseDto.builder()
                .shopId(shopId)
                .userId(userId)
                .favorited(false)
                .build();
    }
}


