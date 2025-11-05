package com.lastnyam.owner.service;

import com.lastnyam.database.entity.*;
import com.lastnyam.owner.dto.*;
import com.lastnyam.owner.exception.ShopException;
import com.lastnyam.owner.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final OwnerRepository ownerRepository;
    private final ShopRepository shopRepository;
    private final MenuRepository menuRepository;
    private final FoocketingRepository foocketingRepository;
    private final DiscountRepository discountRepository;
    private final FoodCategoryRepository foodCategoryRepository;

    @Transactional
    public ShopCreateResponseDto createShop(Integer ownerId, ShopCreateRequestDto request) {
        // 점주 확인
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new ShopException("점주를 찾을 수 없습니다.", 404));

        // 카테고리 확인
        FoodCategory category = foodCategoryRepository.findByCategoryName(request.getCategory())
                .orElseThrow(() -> new ShopException("카테고리를 찾을 수 없습니다.", 404));

        Shop shop = Shop.builder()
                .shopName(request.getShopName())
                .shopLat(request.getShopLat())
                .shopLng(request.getShopLng())
                .shopDescription(request.getShopDescription())
                .shopBanner(request.getShopBanner())
                .shopCloses(request.getShopCloses())
                .shopPickupEndTime(request.getShopPickupEndTime())
                .foodCategory(category)
                .owner(owner)
                .build();
        
        shopRepository.save(shop);

        return ShopCreateResponseDto.builder()
                .shopId(shop.getShopId())
                .build();
    }

    @Transactional
    public MenuCreateResponseDto createMenu(Integer ownerId, Integer shopId, MenuCreateRequestDto request) {
        // 가게 확인 및 점주 권한 확인
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ShopException("가게를 찾을 수 없습니다.", 404));
        
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new ShopException("해당 가게의 점주가 아닙니다.", 403);
        }

        // 카테고리 확인
        FoodCategory foodCategory = foodCategoryRepository.findByCategoryName(request.getCategory())
                .orElseThrow(() -> new ShopException("카테고리를 찾을 수 없습니다.", 404));

        Menu menu = Menu.builder()
                .menuName(request.getMenuName())
                .menuDescription(request.getMenuDescription())
                .menuImage(request.getMenuImage())
                .menuPrice(request.getMenuPrice())
                .shop(shop)
                .foodCategory(foodCategory)
                .build();
        
        menuRepository.save(menu);

        return MenuCreateResponseDto.builder()
                .menuId(menu.getMenuId())
                .build();
    }

    @Transactional
    public FoocketingCreateResponseDto createFoocketing(Integer ownerId, Integer shopId, FoocketingCreateRequestDto request) {
        // 가게 확인 및 점주 권한 확인
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ShopException("가게를 찾을 수 없습니다.", 404));
        
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new ShopException("해당 가게의 점주가 아닙니다.", 403);
        }

        // 메뉴 확인
        Menu menu = menuRepository.findById(request.getMenuId())
                .orElseThrow(() -> new ShopException("메뉴를 찾을 수 없습니다.", 404));
        
        if (!menu.getShop().getShopId().equals(shopId)) {
            throw new ShopException("해당 가게의 메뉴가 아닙니다.", 400);
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime closeTime = nextDateTimeAt(now, shop.getShopCloses());
        LocalDateTime pickupEndTime = nextDateTimeAt(now, shop.getShopPickupEndTime());

        Foocketing foocketing = Foocketing.builder()
                .foocketingTime(request.getFoocketingTime())
                .foocketingAmount(request.getFoocketingAmount())
                .foocketingCloseTime(closeTime)
                .foocketingPickupEndTime(pickupEndTime)
                .menu(menu)
                .build();
        
        foocketingRepository.save(foocketing);

        return FoocketingCreateResponseDto.builder()
                .foocketingId(foocketing.getFoocketingId())
                .build();
    }

    @Transactional
    public DiscountCreateResponseDto createDiscount(Integer ownerId, Integer shopId, DiscountCreateRequestDto request) {
        // 가게 확인 및 점주 권한 확인
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ShopException("가게를 찾을 수 없습니다.", 404));
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new ShopException("해당 가게의 점주가 아닙니다.", 403);
        }

        // 메뉴 확인
        Menu menu = menuRepository.findById(request.getMenuId())
                .orElseThrow(() -> new ShopException("메뉴를 찾을 수 없습니다.", 404));
        if (!menu.getShop().getShopId().equals(shopId)) {
            throw new ShopException("해당 가게의 메뉴가 아닙니다.", 400);
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime closeTime = nextDateTimeAt(now, shop.getShopCloses());
        LocalDateTime pickupEndTime = nextDateTimeAt(now, shop.getShopPickupEndTime());

        Discount discount = Discount.builder()
                .discountDate(request.getDiscountDate())
                .discountRate(request.getDiscountRate())
                .discountPrice(request.getDiscountPrice())
                .discountMenuAmount(request.getDiscountMenuAmount())
                .discountCloseTime(closeTime)
                .discountPickupEndTime(pickupEndTime)
                .menu(menu)
                .build();
        
        discountRepository.save(discount);

        return DiscountCreateResponseDto.builder()
                .discountId(discount.getDiscountId())
                .build();
    }

    /**
     * 주어진 LocalTime을 기준으로 '지금(now) 이후'의 가장 가까운 LocalDateTime을 계산
     * 예: 오늘 18:00이 이미 지났으면 내일 18:00을 반환.-
     */
    private LocalDateTime nextDateTimeAt(LocalDateTime now, LocalTime timeOfDay) {
        LocalDate today = now.toLocalDate();
        LocalDateTime candidate = today.atTime(timeOfDay);
        return candidate.isBefore(now) ? candidate.plusDays(1) : candidate;
    }

}
