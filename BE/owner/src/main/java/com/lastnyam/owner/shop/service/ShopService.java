package com.lastnyam.owner.shop.service;

import com.lastnyam.owner.owner.exception.OwnerErrorCode;
import com.lastnyam.owner.owner.exception.OwnerException;
import com.lastnyam.owner.shop.repository.MenuRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lastnyam.database.entity.FoodCategory;
import com.lastnyam.database.entity.Menu;
import com.lastnyam.database.entity.Owner;
import com.lastnyam.database.entity.Shop;
import com.lastnyam.database.entity.ShopRating;
import com.lastnyam.owner.shop.dto.MenuCreateRequest;
import com.lastnyam.owner.shop.dto.MenuCreateResponse;
import com.lastnyam.owner.shop.dto.MenuGetResponse;
import com.lastnyam.owner.shop.dto.MenuListResponse;
import com.lastnyam.owner.shop.dto.ShopCreateRequest;
import com.lastnyam.owner.shop.dto.ShopCreateResponse;
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

	@Transactional
	public ShopCreateResponse createShop(Integer userId, Integer ownerId, ShopCreateRequest request) {
		checkPermission(userId, ownerId);
		
		// 점주 확인
		Owner owner = ownerRepository.findById(ownerId)
			.orElseThrow(() -> new ShopException(ShopErrorCode.OWNER_NOT_FOUND));

		// 카테고리 확인
		FoodCategory category = foodCategoryRepository.findByCategoryName(request.getCategory())
			.orElseThrow(() -> new ShopException(ShopErrorCode.CATEGORY_NOT_FOUND));

		Shop shop = Shop.builder()
			.shopName(request.getShopName())
			.shopLat(request.getShopLat())
			.shopLng(request.getShopLng())
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

	private static void checkPermission(Integer userId, Integer ownerId) {
		if (!Objects.equals(userId, ownerId)) {
			throw new ShopException(OwnerErrorCode.FORBIDDEN_OWNER_ACCESS);
		}
	}
}
