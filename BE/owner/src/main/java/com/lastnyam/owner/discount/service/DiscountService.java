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
import com.lastnyam.owner.owner.exception.OwnerErrorCode;
import com.lastnyam.owner.owner.exception.OwnerException;
import com.lastnyam.owner.shop.exception.ShopErrorCode;
import com.lastnyam.owner.shop.exception.ShopException;
import com.lastnyam.owner.shop.repository.MenuRepository;
import com.lastnyam.owner.shop.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final ShopRepository shopRepository;
    private final MenuRepository menuRepository;
    private final DiscountRepository discountRepository;

    @Transactional
    public DiscountCreateResponse createDiscount(Integer userId, Integer ownerId, Integer shopId, DiscountCreateRequest request) {
        checkPermission(userId, ownerId);
        
        // 가게 확인 및 점주 권한 확인
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new DiscountException(ShopErrorCode.SHOP_NOT_FOUND));
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new DiscountException(ShopErrorCode.NOT_SHOP_OWNER);
        }

        // 메뉴 확인
        Menu menu = menuRepository.findById(request.getMenuId())
                .orElseThrow(() -> new DiscountException(ShopErrorCode.MENU_NOT_FOUND));
        if (!menu.getShop().getShopId().equals(shopId)) {
                throw new DiscountException(ShopErrorCode.MENU_NOT_IN_SHOP);
        }

        // 할인 가격 검증
        Integer originalPrice = menu.getMenuPrice();
        Integer discountPrice = request.getDiscountPrice();
        
        if (discountPrice >= originalPrice) {
            throw new DiscountException(DiscountErrorCode.INVALID_DISCOUNT_PRICE);
        }

        // 할인율 계산 (소수점 버림)
        Integer discountRate = (int) (((double) (originalPrice - discountPrice) / originalPrice) * 100);

        // 가게 마감 / 픽업 마감 시간 계산
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime closeTime = calculateTargetTime(now, shop.getShopCloses());
        LocalDateTime pickupEndTime = calculateTargetTime(now, shop.getShopPickupEndTime());

        // 픽업 마감 시간이 현재 시간보다 이전이면 주문 불가
        if (pickupEndTime.isBefore(now) || pickupEndTime.isEqual(now)) {
            throw new DiscountException(DiscountErrorCode.PICKUP_TIME_PASSED);
        }

        Discount discount = Discount.builder()
                .discountDate(now.toLocalDate())
                .discountRate(discountRate)
                .discountPrice(discountPrice)
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
    public DiscountListResponse getActiveDiscounts(Integer userId, Integer ownerId, Integer shopId) {
        checkPermission(userId, ownerId);
        
        // 가게 확인 및 점주 권한 확인
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new DiscountException(ShopErrorCode.SHOP_NOT_FOUND));
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new DiscountException(ShopErrorCode.NOT_SHOP_OWNER);
        }

        // 활성화된 마감세일 조회 (픽업 마감 시간이 현재 이후인 것만)
        LocalDateTime now = LocalDateTime.now();
        List<Discount> discounts = discountRepository.findActiveByShopId(shopId, now);

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

    /**
     * 현재 시간과 목표 시간(LocalTime)을 비교하여 적절한 LocalDateTime을 반환
     * 목표 시간이 현재 시간보다 이전이면 다음날로 설정
     */
    private LocalDateTime calculateTargetTime(LocalDateTime now, LocalTime targetTime) {
        LocalDateTime targetDateTime = LocalDateTime.of(now.toLocalDate(), targetTime);
        
        // 목표 시간이 현재 시간보다 이전이면 다음날로 설정
        if (targetDateTime.isBefore(now) || targetDateTime.isEqual(now)) {
            targetDateTime = targetDateTime.plusDays(1);
        }
        
        return targetDateTime;
    }

    private static void checkPermission(Integer userId, Integer ownerId) {
        if (!Objects.equals(userId, ownerId)) {
            throw new OwnerException(OwnerErrorCode.FORBIDDEN_OWNER_ACCESS);
        }
    }
}
