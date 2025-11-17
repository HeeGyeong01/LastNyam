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

		LocalDateTime now = LocalDateTime.now();
		LocalTime foocketingTimeInput = request.getFoocketingTime();
		
		// 영업일 기준 시간 계산 (오전 6시 기준)
		LocalDateTime closeTime = toBusinessDateTime(now, shop.getShopCloses());
		LocalDateTime pickupEndTime = toBusinessDateTime(now, shop.getShopPickupEndTime());
		LocalDateTime foocketingTime = toBusinessDateTime(now, foocketingTimeInput);

		// 픽업 마감 시간이 현재 시간보다 이전이면 주문 불가
		if (pickupEndTime.isBefore(now) || pickupEndTime.isEqual(now)) {
			throw new FoocketingException(FoocketingErrorCode.PICKUP_TIME_PASSED);
		}
		
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
	 * - 현재 23:00, 입력 00:30 → 다음날 00:30 (같은 영업일의 새벽 시간)
	 * - 현재 01:00, 입력 02:00 → 오늘 02:00 (아직 같은 영업일)
	 * - 현재 07:00, 입력 20:00 → 오늘 20:00 (새로운 영업일)
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
	public void updateFoocketing(Integer userId, Integer ownerId, Integer shopId, Integer foocketingId,
			com.lastnyam.owner.foocketing.dto.FoocketingUpdateRequest request) {
		checkPermission(userId, ownerId);

		// 가게 확인 및 점주 권한 확인
		Shop shop = shopRepository.findById(shopId)
			.orElseThrow(() -> new FoocketingException(ShopErrorCode.SHOP_NOT_FOUND));

		if (!shop.getOwner().getOwnerId().equals(ownerId)) {
			throw new FoocketingException(ShopErrorCode.NOT_SHOP_OWNER);
		}

		// 푸켓팅 확인
		Foocketing foocketing = foocketingRepository.findById(foocketingId)
			.orElseThrow(() -> new FoocketingException(FoocketingErrorCode.FOOCKETING_NOT_FOUND));

		// 푸켓팅이 해당 가게의 메뉴인지 확인
		if (!foocketing.getMenu().getShop().getShopId().equals(shopId)) {
			throw new FoocketingException(ShopErrorCode.MENU_NOT_IN_SHOP);
		}

		LocalDateTime now = LocalDateTime.now();

		// 푸켓팅 시간 수정이 있는 경우
		if (request.getFoocketingTime() != null) {
			LocalDateTime newFoocketingTime = toBusinessDateTime(now, request.getFoocketingTime());
			
			// 푸켓팅 시간이 현재 시간보다 이전이면 안됨
			if (newFoocketingTime.isBefore(now) || newFoocketingTime.isEqual(now)) {
				throw new FoocketingException(FoocketingErrorCode.INVALID_FOOCKETING_TIME);
			}
			
			// 푸켓팅 시간이 픽업 마감 시간 이후면 안됨
			if (newFoocketingTime.isAfter(foocketing.getFoocketingPickupEndTime())) {
				throw new FoocketingException(FoocketingErrorCode.FOOCKETING_TIME_AFTER_PICKUP_END);
			}

			foocketing.setFoocketingTime(newFoocketingTime);
		}

		// 푸켓팅 수량 수정이 있는 경우
		if (request.getFoocketingAmount() != null) {
			foocketing.setFoocketingAmount(request.getFoocketingAmount());
		}
	}

	@Transactional
	public void deleteFoocketing(Integer userId, Integer ownerId, Integer shopId, Integer foocketingId) {
		checkPermission(userId, ownerId);

		// 가게 확인 및 점주 권한 확인
		Shop shop = shopRepository.findById(shopId)
			.orElseThrow(() -> new FoocketingException(ShopErrorCode.SHOP_NOT_FOUND));

		if (!shop.getOwner().getOwnerId().equals(ownerId)) {
			throw new FoocketingException(ShopErrorCode.NOT_SHOP_OWNER);
		}

		// 푸켓팅 확인
		Foocketing foocketing = foocketingRepository.findById(foocketingId)
			.orElseThrow(() -> new FoocketingException(FoocketingErrorCode.FOOCKETING_NOT_FOUND));

		// 푸켓팅이 해당 가게의 메뉴인지 확인
		if (!foocketing.getMenu().getShop().getShopId().equals(shopId)) {
			throw new FoocketingException(ShopErrorCode.MENU_NOT_IN_SHOP);
		}

		foocketingRepository.delete(foocketing);
	}

	private static void checkPermission(Integer userId, Integer ownerId) {
		if (!Objects.equals(userId, ownerId)) {
			throw new OwnerException(OwnerErrorCode.FORBIDDEN_OWNER_ACCESS);
		}
	}
}
