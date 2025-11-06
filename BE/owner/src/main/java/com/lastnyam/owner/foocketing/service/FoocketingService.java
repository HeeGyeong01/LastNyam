package com.lastnyam.owner.foocketing.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.lastnyam.owner.foocketing.exception.FoocketingErrorCode;
import com.lastnyam.owner.foocketing.exception.FoocketingException;
import com.lastnyam.owner.foocketing.repository.FoocketingRepository;
import com.lastnyam.owner.owner.exception.OwnerErrorCode;
import com.lastnyam.owner.owner.exception.OwnerException;
import com.lastnyam.owner.shop.exception.ShopErrorCode;
import com.lastnyam.owner.shop.repository.MenuRepository;
import com.lastnyam.owner.shop.repository.ShopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lastnyam.database.entity.Foocketing;
import com.lastnyam.database.entity.Menu;
import com.lastnyam.database.entity.Shop;
import com.lastnyam.owner.foocketing.dto.FoocketingCreateRequest;
import com.lastnyam.owner.foocketing.dto.FoocketingCreateResponse;
import com.lastnyam.owner.foocketing.dto.FoocketingGetResponse;
import com.lastnyam.owner.foocketing.dto.FoocketingListResponse;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoocketingService {

	private final ShopRepository shopRepository;
	private final MenuRepository menuRepository;
	private final FoocketingRepository foocketingRepository;

	@Transactional
	public FoocketingCreateResponse createFoocketing(Integer userId, Integer ownerId, Integer shopId, FoocketingCreateRequest request) {
		checkPermission(userId, ownerId);
		
		// 가게 확인 및 점주 권한 확인
		Shop shop = shopRepository.findById(shopId)
			.orElseThrow(() -> new FoocketingException(ShopErrorCode.SHOP_NOT_FOUND));

		if (!shop.getOwner().getOwnerId().equals(ownerId)) {
			throw new FoocketingException(ShopErrorCode.NOT_SHOP_OWNER);
		}

		// 메뉴 확인
		Menu menu = menuRepository.findById(request.getMenuId())
			.orElseThrow(() -> new FoocketingException(ShopErrorCode.MENU_NOT_FOUND));

		if (!menu.getShop().getShopId().equals(shopId)) {
			throw new FoocketingException(ShopErrorCode.MENU_NOT_IN_SHOP);
		}

		// 가게 마감 / 픽업 마감 시간 계산
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime closeTime = calculateTargetTime(now, shop.getShopCloses());
		LocalDateTime pickupEndTime = calculateTargetTime(now, shop.getShopPickupEndTime());

		// 픽업 마감 시간이 현재 시간보다 이전이면 주문 불가
		if (pickupEndTime.isBefore(now) || pickupEndTime.isEqual(now)) {
			throw new FoocketingException(FoocketingErrorCode.PICKUP_TIME_PASSED);
		}

		// 푸켓팅 시간 계산 (LocalTime -> LocalDateTime)
		LocalTime foocketingTimeInput = request.getFoocketingTime();
		LocalDateTime foocketingTime = calculateTargetTime(now, foocketingTimeInput);
		
		// 푸켓팅 시간이 현재 시간보다 이전이면 안됨
		if (foocketingTime.isBefore(now) || foocketingTime.isEqual(now)) {
			throw new FoocketingException(FoocketingErrorCode.INVALID_FOOCKETING_TIME);
		}
		
		// 푸켓팅 시간이 픽업 마감 시간 이후면 안됨
		if (foocketingTime.isAfter(pickupEndTime)) {
			throw new FoocketingException(FoocketingErrorCode.FOOCKETING_TIME_AFTER_PICKUP_END);
		}

		Foocketing foocketing = Foocketing.builder()
			.foocketingTime(foocketingTime)
			.foocketingAmount(request.getFoocketingAmount())
			.foocketingCloseTime(closeTime)
			.foocketingPickupEndTime(pickupEndTime)
			.menu(menu)
			.build();

		foocketingRepository.save(foocketing);

		return FoocketingCreateResponse.builder()
			.foocketingId(foocketing.getFoocketingId())
			.build();
	}

	@Transactional(readOnly = true)
	public FoocketingListResponse getActiveFoocketings(Integer userId, Integer ownerId, Integer shopId) {
		checkPermission(userId, ownerId);
		
		// 가게 확인 및 점주 권한 확인
		Shop shop = shopRepository.findById(shopId)
			.orElseThrow(() -> new FoocketingException(ShopErrorCode.SHOP_NOT_FOUND));
		
		if (!shop.getOwner().getOwnerId().equals(ownerId)) {
			throw new FoocketingException(ShopErrorCode.NOT_SHOP_OWNER);
		}

		// 활성화된 푸켓팅 조회 (픽업 마감 시간이 현재 이후인 것만)
		LocalDateTime now = LocalDateTime.now();
		List<Foocketing> foocketings = foocketingRepository.findActiveByShopId(shopId, now);

		// DTO로 변환
		List<FoocketingGetResponse> foocketingList = foocketings.stream()
			.map(foocketing -> {
				Menu menu = foocketing.getMenu();
				return FoocketingGetResponse.builder()
					.foocketingId(foocketing.getFoocketingId())
					.foocketingTime(foocketing.getFoocketingTime())
					.foocketingAmount(foocketing.getFoocketingAmount())
					.foocketingCloseTime(foocketing.getFoocketingCloseTime())
					.foocketingPickupEndTime(foocketing.getFoocketingPickupEndTime())
					.menuId(menu.getMenuId())
					.menuName(menu.getMenuName())
					.menuPrice(menu.getMenuPrice())
					.menuImage(menu.getMenuImage())
					.build();
			})
			.collect(Collectors.toList());
		
		return FoocketingListResponse.builder()
			.foocketings(foocketingList)
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
