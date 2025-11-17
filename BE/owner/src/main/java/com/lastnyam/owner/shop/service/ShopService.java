package com.lastnyam.owner.shop.service;

import com.lastnyam.owner.external.geocoding.dto.Coordinates;
import com.lastnyam.owner.external.geocoding.service.GeocodingService;
import com.lastnyam.owner.owner.exception.OwnerErrorCode;
import com.lastnyam.owner.owner.exception.OwnerException;
import com.lastnyam.owner.shop.dto.*;
import com.lastnyam.owner.shop.repository.MenuRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lastnyam.database.entity.FoodCategory;
import com.lastnyam.database.entity.Menu;
import com.lastnyam.database.entity.Owner;
import com.lastnyam.database.entity.Shop;
import com.lastnyam.database.entity.ShopRating;
import com.lastnyam.owner.shop.repository.FoodCategoryRepository;
import com.lastnyam.owner.owner.repository.OwnerRepository;
import com.lastnyam.owner.shop.repository.ShopRatingRepository;
import com.lastnyam.owner.shop.repository.ShopRepository;
import com.lastnyam.owner.shop.exception.ShopErrorCode;
import com.lastnyam.owner.shop.exception.ShopException;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Objects;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ShopService {

	private final OwnerRepository ownerRepository;
	private final ShopRepository shopRepository;
	private final MenuRepository menuRepository;
	private final FoodCategoryRepository foodCategoryRepository;
	private final ShopRatingRepository shopRatingRepository;
	private final GeocodingService geocodingService;

	@Transactional
	public ShopCreateResponse createShop(Integer userId, Integer ownerId, ShopCreateRequest request) {
		checkPermission(userId, ownerId);
		
		// 점주 확인
		Owner owner = ownerRepository.findById(ownerId)
			.orElseThrow(() -> new ShopException(ShopErrorCode.OWNER_NOT_FOUND));

		// 카테고리 확인
		FoodCategory category = foodCategoryRepository.findByCategoryName(request.getCategory())
			.orElseThrow(() -> new ShopException(ShopErrorCode.CATEGORY_NOT_FOUND));

		// 주소를 위도/경도로 변환
		Coordinates coordinates = geocodingService.getCoordinates(request.getShopAddress());

		Shop shop = Shop.builder()
			.shopName(request.getShopName())
			.shopLat(coordinates.getLatitude())
			.shopLng(coordinates.getLongitude())
			.shopAddress(request.getShopAddress())
			.shopDescription(request.getShopDescription())
			.shopBanner(request.getShopBanner())
			.shopCloses(request.getShopCloses())
			.shopPickupEndTime(request.getShopPickupEndTime())
			.foodCategory(category)
			.owner(owner)
			.build();

		shopRepository.save(shop);

		// ShopRating 초기 데이터 생성 (랜덤)
		Random random = new Random();
		
		// 평균 평점: 3.5 ~ 5.0 (소수점 한 자리)
		double shopRatingAverage = 3.5 + (random.nextDouble() * 1.5);
		shopRatingAverage = Math.round(shopRatingAverage * 10) / 10.0;
		
		// 평점 개수: 10 ~ 50 (평균을 계산하기 위한 적절한 개수)
		int shopRatingCount = 10 + random.nextInt(41);
		
		// 평점 합계: 평균 * 개수
		int shopRatingSum = (int) Math.round(shopRatingAverage * shopRatingCount);
		
		// 찜 개수: 0 ~ 100
		int shopFavoriteCount = random.nextInt(101);
		
		ShopRating shopRating = ShopRating.builder()
			.shop(shop)
			.shopRatingAverage(shopRatingAverage)
			.shopRatingCount(shopRatingCount)
			.shopRatingSum(shopRatingSum)
			.shopFavoriteCount(shopFavoriteCount)
			.build();
		
		shopRatingRepository.save(shopRating);

		return ShopCreateResponse.builder()
			.shopId(shop.getShopId())
			.build();
	}

	@Transactional
	public MenuCreateResponse createMenu(Integer userId, Integer ownerId, Integer shopId, MenuCreateRequest request) {
		checkPermission(userId, ownerId);
		
		// 가게 확인 및 점주 권한 확인
		Shop shop = shopRepository.findById(shopId)
			.orElseThrow(() -> new ShopException(ShopErrorCode.SHOP_NOT_FOUND));

		if (!shop.getOwner().getOwnerId().equals(ownerId)) {
			throw new ShopException(ShopErrorCode.NOT_SHOP_OWNER);
		}

		// 카테고리 확인
		FoodCategory foodCategory = foodCategoryRepository.findByCategoryName(request.getCategory())
			.orElseThrow(() -> new ShopException(ShopErrorCode.CATEGORY_NOT_FOUND));

		Menu menu = Menu.builder()
			.menuName(request.getMenuName())
			.menuDescription(request.getMenuDescription())
			.menuImage(request.getMenuImage())
			.menuPrice(request.getMenuPrice())
			.shop(shop)
			.foodCategory(foodCategory)
			.build();

		menuRepository.save(menu);

		return MenuCreateResponse.builder()
			.menuId(menu.getMenuId())
			.build();
	}

	@Transactional(readOnly = true)
	public MenuListResponse getShopMenus(Integer userId, Integer ownerId, Integer shopId) {
		checkPermission(userId, ownerId);
		
		// 가게 확인 및 점주 권한 확인
		Shop shop = shopRepository.findById(shopId)
			.orElseThrow(() -> new ShopException(ShopErrorCode.SHOP_NOT_FOUND));

		if (!shop.getOwner().getOwnerId().equals(ownerId)) {
			throw new ShopException(ShopErrorCode.NOT_SHOP_OWNER);
		}

		// 가게의 메뉴 목록 조회
		List<Menu> menus = menuRepository.findByShopId(shopId);

		// DTO로 변환
		List<MenuGetResponse> menuList = menus.stream()
			.map(menu -> MenuGetResponse.builder()
				.menuId(menu.getMenuId())
				.menuName(menu.getMenuName())
				.menuDescription(menu.getMenuDescription())
				.menuImage(menu.getMenuImage())
				.menuPrice(menu.getMenuPrice())
				.categoryName(menu.getFoodCategory().getCategoryName())
				.build())
			.toList();
		
		return MenuListResponse.builder()
			.menus(menuList)
			.build();
	}

	@Transactional
	public void updateMenu(Integer userId, Integer ownerId, Integer shopId, Integer menuId, MenuUpdateRequest request) {
		checkPermission(userId, ownerId);

		// 가게 확인 및 점주 권한 확인
		Shop shop = shopRepository.findById(shopId)
			.orElseThrow(() -> new ShopException(ShopErrorCode.SHOP_NOT_FOUND));

		if (!shop.getOwner().getOwnerId().equals(ownerId)) {
			throw new ShopException(ShopErrorCode.NOT_SHOP_OWNER);
		}

		// 메뉴 확인
		Menu menu = menuRepository.findById(menuId)
			.orElseThrow(() -> new ShopException(ShopErrorCode.MENU_NOT_FOUND));

		// 메뉴가 해당 가게의 것인지 확인
		if (!menu.getShop().getShopId().equals(shopId)) {
			throw new ShopException(ShopErrorCode.MENU_NOT_IN_SHOP);
		}

		// 메뉴명 수정
		if (request.getMenuName() != null) {
			menu.setMenuName(request.getMenuName());
		}

		// 메뉴 설명 수정
		if (request.getMenuDescription() != null) {
			menu.setMenuDescription(request.getMenuDescription());
		}

		// 메뉴 이미지 수정
		if (request.getMenuImage() != null) {
			menu.setMenuImage(request.getMenuImage());
		}

		// 메뉴 가격 수정
		if (request.getMenuPrice() != null) {
			menu.setMenuPrice(request.getMenuPrice());
		}

		// 카테고리 수정
		if (request.getCategory() != null) {
			FoodCategory foodCategory = foodCategoryRepository.findByCategoryName(request.getCategory())
				.orElseThrow(() -> new ShopException(ShopErrorCode.CATEGORY_NOT_FOUND));
			menu.setFoodCategory(foodCategory);
		}
	}

	@Transactional
	public void deleteMenu(Integer userId, Integer ownerId, Integer shopId, Integer menuId) {
		checkPermission(userId, ownerId);

		// 가게 확인 및 점주 권한 확인
		Shop shop = shopRepository.findById(shopId)
			.orElseThrow(() -> new ShopException(ShopErrorCode.SHOP_NOT_FOUND));

		if (!shop.getOwner().getOwnerId().equals(ownerId)) {
			throw new ShopException(ShopErrorCode.NOT_SHOP_OWNER);
		}

		// 메뉴 확인
		Menu menu = menuRepository.findById(menuId)
			.orElseThrow(() -> new ShopException(ShopErrorCode.MENU_NOT_FOUND));

		// 메뉴가 해당 가게의 것인지 확인
		if (!menu.getShop().getShopId().equals(shopId)) {
			throw new ShopException(ShopErrorCode.MENU_NOT_IN_SHOP);
		}

		menuRepository.delete(menu);
	}

	private static void checkPermission(Integer userId, Integer ownerId) {
		if (!Objects.equals(userId, ownerId)) {
			throw new ShopException(OwnerErrorCode.FORBIDDEN_OWNER_ACCESS);
		}
	}
}
