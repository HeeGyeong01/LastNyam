package com.lastnyam.owner.discount.service;

import com.lastnyam.database.entity.Discount;
import com.lastnyam.database.entity.Menu;
import com.lastnyam.database.entity.Shop;
import com.lastnyam.owner.discount.dto.DiscountCreateRequest;
import com.lastnyam.owner.discount.dto.DiscountCreateResponse;
import com.lastnyam.owner.discount.dto.DiscountGetResponse;
import com.lastnyam.owner.discount.dto.DiscountListResponse;
import com.lastnyam.owner.discount.exception.DiscountErrorCode;
import com.lastnyam.owner.discount.exception.DiscountException;
import com.lastnyam.owner.discount.repository.DiscountRepository;
import com.lastnyam.owner.shop.repository.MenuRepository;
import com.lastnyam.owner.shop.repository.ShopRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final ShopRepository shopRepository;
    private final MenuRepository menuRepository;
    private final DiscountRepository discountRepository;

    @Transactional
    public DiscountCreateResponse createDiscount(Integer ownerId, Integer shopId, DiscountCreateRequest request) {
        // 가게 확인 및 점주 권한 확인
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new DiscountException(DiscountErrorCode.SHOP_NOT_FOUND));
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new DiscountException(DiscountErrorCode.NOT_SHOP_OWNER);
        }

        // 메뉴 확인
        Menu menu = menuRepository.findById(request.getMenuId())
                .orElseThrow(() -> new DiscountException(DiscountErrorCode.MENU_NOT_FOUND));
        if (!menu.getShop().getShopId().equals(shopId)) {
            throw new DiscountException(DiscountErrorCode.MENU_NOT_IN_SHOP);
        }

        // 가게 마감 / 픽업 마감 시간 계산
        LocalDate now = LocalDate.now();
        LocalDateTime closeTime = LocalDateTime.of(now, shop.getShopCloses());
        LocalDateTime pickupEndTime = LocalDateTime.of(now, shop.getShopPickupEndTime());

        Discount discount = Discount.builder()
                .discountDate(now)
                .discountRate(request.getDiscountRate())
                .discountPrice(request.getDiscountPrice())
                .discountMenuAmount(request.getDiscountMenuAmount())
                .discountCloseTime(closeTime)
                .discountPickupEndTime(pickupEndTime)
                .menu(menu)
                .build();

        discountRepository.save(discount);

        return DiscountCreateResponse.builder()
                .discountId(discount.getDiscountId())
                .build();
    }

    @Transactional(readOnly = true)
    public DiscountListResponse getActiveDiscounts(Integer ownerId, Integer shopId) {
        // 가게 확인 및 점주 권한 확인
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new DiscountException(DiscountErrorCode.SHOP_NOT_FOUND));
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new DiscountException(DiscountErrorCode.NOT_SHOP_OWNER);
        }

        // 오늘 날짜의 마감세일 조회
        LocalDate today = LocalDate.now();
        List<Discount> discounts = discountRepository.findByShopIdAndDiscountDate(shopId, today);

        // DTO로 변환
        List<DiscountGetResponse> discountList = discounts.stream()
                .map(discount -> {
                    Menu menu = discount.getMenu();
                    return DiscountGetResponse.builder()
                            .discountId(discount.getDiscountId())
                            .discountDate(discount.getDiscountDate())
                            .discountRate(discount.getDiscountRate())
                            .discountPrice(discount.getDiscountPrice())
                            .discountMenuAmount(discount.getDiscountMenuAmount())
                            .discountCloseTime(discount.getDiscountCloseTime())
                            .discountPickupEndTime(discount.getDiscountPickupEndTime())
                            .menuId(menu.getMenuId())
                            .menuName(menu.getMenuName())
                            .menuPrice(menu.getMenuPrice())
                            .menuImage(menu.getMenuImage())
                            .build();
                })
                .collect(Collectors.toList());

        return DiscountListResponse.builder()
                .discounts(discountList)
                .build();
    }
}
