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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
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
    public DiscountCreateResponse createDiscount(Integer userId, Integer ownerId, Integer shopId,
            DiscountCreateRequest request) {
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

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        
        // 영업일 기준 시간 계산 (오전 6시 기준)
        LocalDateTime closeTime = toBusinessDateTime(now, shop.getShopCloses());
        LocalDateTime pickupEndTime = toBusinessDateTime(now, shop.getShopPickupEndTime());
        LocalDate businessDate = getBusinessDate(now);

        // 픽업 마감 시간이 현재 시간보다 이전이면 주문 불가
        if (pickupEndTime.isBefore(now) || pickupEndTime.isEqual(now)) {
            throw new DiscountException(DiscountErrorCode.PICKUP_TIME_PASSED);
        }

        Discount discount = Discount.builder()
                .discountDate(businessDate)
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
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
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
     * 영업일 기준 "오늘" 날짜를 반환
     * 새벽 6시 전이면 전날로 간주 (영업일 개념)
     */
    private LocalDate getBusinessDate(LocalDateTime now) {
        LocalTime cutoffTime = LocalTime.of(6, 0); // 오전 6시
        
        if (now.toLocalTime().isBefore(cutoffTime)) {
            // 새벽 6시 전이면 전날 영업일로 간주
            return now.toLocalDate().minusDays(1);
        } else {
            return now.toLocalDate();
        }
    }

    /**
     * 영업일 기준으로 LocalTime을 LocalDateTime으로 변환
     * 오전 6시 기준으로 영업일을 구분하여 적절한 날짜와 시간을 조합
     * 
     * 예시:
     * - 현재 23:00, 마감 02:00 → 다음날 02:00 (같은 영업일의 새벽 마감)
     * - 현재 01:00, 마감 02:00 → 오늘 02:00 (아직 같은 영업일)
     * - 현재 07:00, 마감 22:00 → 오늘 22:00 (새로운 영업일)
     */
    private LocalDateTime toBusinessDateTime(LocalDateTime now, LocalTime targetTime) {
        LocalDate businessDate = getBusinessDate(now);
        LocalTime cutoffTime = LocalTime.of(6, 0);
        
        // 목표 시간이 오전 6시 이전이면 다음날 새벽 시간
        if (targetTime.isBefore(cutoffTime)) {
            return LocalDateTime.of(businessDate.plusDays(1), targetTime);
        } else {
            return LocalDateTime.of(businessDate, targetTime);
        }
    }

    @Transactional
    public void updateDiscount(Integer userId, Integer ownerId, Integer shopId, Integer discountId,
            com.lastnyam.owner.discount.dto.DiscountUpdateRequest request) {
        checkPermission(userId, ownerId);

        // 가게 확인 및 점주 권한 확인
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new DiscountException(ShopErrorCode.SHOP_NOT_FOUND));
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new DiscountException(ShopErrorCode.NOT_SHOP_OWNER);
        }

        // 마감세일 확인
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new DiscountException(DiscountErrorCode.DISCOUNT_NOT_FOUND));

        // 마감세일이 해당 가게의 메뉴인지 확인
        if (!discount.getMenu().getShop().getShopId().equals(shopId)) {
            throw new DiscountException(ShopErrorCode.MENU_NOT_IN_SHOP);
        }

		// 할인 가격 수정이 있는 경우
		if (request.getDiscountPrice() != null) {
			Menu menu = discount.getMenu();
			Integer originalPrice = menu.getMenuPrice();
			Integer newDiscountPrice = request.getDiscountPrice();

			// 할인 가격 검증
			if (newDiscountPrice >= originalPrice) {
				throw new DiscountException(DiscountErrorCode.INVALID_DISCOUNT_PRICE);
			}

			// 할인율 재계산 (소수점 버림)
			Integer newDiscountRate = (int) (((double) (originalPrice - newDiscountPrice) / originalPrice) * 100);

			discount.setDiscountPrice(newDiscountPrice);
			discount.setDiscountRate(newDiscountRate);
		}

		// 마감세일 수량 수정이 있는 경우
		if (request.getDiscountMenuAmount() != null) {
			discount.setDiscountMenuAmount(request.getDiscountMenuAmount());
		}
    }

    @Transactional
    public void deleteDiscount(Integer userId, Integer ownerId, Integer shopId, Integer discountId) {
        checkPermission(userId, ownerId);

        // 가게 확인 및 점주 권한 확인
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new DiscountException(ShopErrorCode.SHOP_NOT_FOUND));
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new DiscountException(ShopErrorCode.NOT_SHOP_OWNER);
        }

        // 마감세일 확인
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new DiscountException(DiscountErrorCode.DISCOUNT_NOT_FOUND));

        // 마감세일이 해당 가게의 메뉴인지 확인
        if (!discount.getMenu().getShop().getShopId().equals(shopId)) {
            throw new DiscountException(ShopErrorCode.MENU_NOT_IN_SHOP);
        }

        discountRepository.delete(discount);
    }

    private static void checkPermission(Integer userId, Integer ownerId) {
        if (!Objects.equals(userId, ownerId)) {
            throw new OwnerException(OwnerErrorCode.FORBIDDEN_OWNER_ACCESS);
        }
    }
}
