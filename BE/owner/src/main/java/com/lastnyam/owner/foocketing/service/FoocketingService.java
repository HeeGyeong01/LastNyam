package com.lastnyam.owner.foocketing.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.lastnyam.owner.foocketing.exception.FoocketingErrorCode;
import com.lastnyam.owner.foocketing.exception.FoocketingException;
import com.lastnyam.owner.foocketing.repository.FoocketingRepository;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoocketingService {

	private final ShopRepository shopRepository;
	private final MenuRepository menuRepository;
	private final FoocketingRepository foocketingRepository;

	@Transactional
	public FoocketingCreateResponse createFoocketing(Integer ownerId, Integer shopId, FoocketingCreateRequest request) {
		// 가게 확인 및 점주 권한 확인
		Shop shop = shopRepository.findById(shopId)
			.orElseThrow(() -> new FoocketingException(FoocketingErrorCode.SHOP_NOT_FOUND));

		if (!shop.getOwner().getOwnerId().equals(ownerId)) {
			throw new FoocketingException(FoocketingErrorCode.NOT_SHOP_OWNER);
		}

		// 메뉴 확인
		Menu menu = menuRepository.findById(request.getMenuId())
			.orElseThrow(() -> new FoocketingException(FoocketingErrorCode.MENU_NOT_FOUND));

		if (!menu.getShop().getShopId().equals(shopId)) {
			throw new FoocketingException(FoocketingErrorCode.MENU_NOT_IN_SHOP);
		}

		// 가게 마감 / 픽업 마감 시간 계산
		LocalDate now = LocalDate.now();
		LocalDateTime closeTime = LocalDateTime.of(now, shop.getShopCloses());
		LocalDateTime pickupEndTime = LocalDateTime.of(now, shop.getShopPickupEndTime());

		Foocketing foocketing = Foocketing.builder()
			.foocketingTime(request.getFoocketingTime())
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
	public FoocketingListResponse getActiveFoocketings(Integer ownerId, Integer shopId) {
		// 가게 확인 및 점주 권한 확인
		Shop shop = shopRepository.findById(shopId)
			.orElseThrow(() -> new FoocketingException(FoocketingErrorCode.SHOP_NOT_FOUND));
		
		if (!shop.getOwner().getOwnerId().equals(ownerId)) {
			throw new FoocketingException(FoocketingErrorCode.NOT_SHOP_OWNER);
		}

		// 오늘 날짜의 푸켓팅 조회
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
		LocalDateTime endOfDay = startOfDay.plusDays(1);
		
		List<Foocketing> foocketings = foocketingRepository.findByShopIdAndToday(shopId, startOfDay, endOfDay);

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
}
