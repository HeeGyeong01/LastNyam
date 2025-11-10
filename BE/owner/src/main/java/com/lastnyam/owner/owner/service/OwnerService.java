package com.lastnyam.owner.owner.service;

import com.lastnyam.database.entity.Owner;
import com.lastnyam.database.entity.Shop;
import com.lastnyam.owner.owner.dto.OwnerDetailResponse;
import com.lastnyam.owner.owner.dto.OwnerRegisterRequest;
import com.lastnyam.owner.owner.dto.ShopDetailResponse;
import com.lastnyam.owner.owner.dto.ShopListResponse;
import com.lastnyam.owner.owner.exception.OwnerErrorCode;
import com.lastnyam.owner.owner.exception.OwnerException;
import com.lastnyam.owner.owner.repository.OwnerRepository;
import com.lastnyam.owner.shop.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OwnerService {

    private final OwnerRepository ownerRepository;
    private final ShopRepository shopRepository;
    private final PasswordEncoder passwordEncoder;

    public void register(OwnerRegisterRequest request) {
        // 이메일 중복 확인
        if (ownerRepository.existsByOwnerEmail(request.getEmail())) {
            throw new OwnerException(OwnerErrorCode.EMAIL_ALREADY_EXISTS);
        }
        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // Owner 엔티티 생성 및 저장
        Owner owner = Owner.builder()
                .ownerEmail(request.getEmail())
                .ownerPassword(encodedPassword)
                .build();

        ownerRepository.save(owner);
    }

    @Transactional(readOnly = true)
    public ShopListResponse getOwnerShops(Integer userId, Integer ownerId) {
        checkPermission(userId, ownerId);

        // 점주 확인
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new OwnerException(OwnerErrorCode.OWNER_NOT_FOUND));

        // 점주의 가게 목록 조회
        List<Shop> shops = shopRepository.findByOwnerId(ownerId);

        		// DTO로 변환
		List<ShopDetailResponse> shopList = shops.stream()
				.map(shop -> ShopDetailResponse.builder()
						.shopId(shop.getShopId())
						.shopName(shop.getShopName())
						.shopLat(shop.getShopLat())
						.shopLng(shop.getShopLng())
						.shopAddress(shop.getShopAddress())
						.shopDescription(shop.getShopDescription())
						.shopBanner(shop.getShopBanner())
						.shopCloses(shop.getShopCloses())
						.shopPickupEndTime(shop.getShopPickupEndTime())
						.categoryName(shop.getFoodCategory().getCategoryName())
						.build())
				.collect(Collectors.toList());
        
        return ShopListResponse.builder()
                .shops(shopList)
                .build();
    }

    public OwnerDetailResponse getProfile(Integer ownerId) {
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new OwnerException(OwnerErrorCode.OWNER_NOT_FOUND));
        return OwnerDetailResponse.builder()
                .ownerId(owner.getOwnerId())
                .build();
    }

    private static void checkPermission(Integer userId, Integer ownerId) {
        if (!userId.equals(ownerId)) {
            throw new OwnerException(OwnerErrorCode.FORBIDDEN_OWNER_ACCESS);
        }
    }
}
