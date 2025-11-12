package com.lastnyam.owner.shop.service;

import com.lastnyam.owner.shop.repository.MenuRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lastnyam.database.entity.FoodCategory;
import com.lastnyam.database.entity.Menu;
import com.lastnyam.database.entity.Owner;
import com.lastnyam.database.entity.Shop;
import com.lastnyam.owner.shop.dto.MenuCreateRequest;
import com.lastnyam.owner.shop.dto.MenuCreateResponse;
import com.lastnyam.owner.shop.dto.MenuGetResponse;
import com.lastnyam.owner.shop.dto.MenuListResponse;
import com.lastnyam.owner.shop.dto.ShopCreateRequest;
import com.lastnyam.owner.shop.dto.ShopCreateResponse;
import com.lastnyam.owner.shop.repository.FoodCategoryRepository;
import com.lastnyam.owner.owner.repository.OwnerRepository;
import com.lastnyam.owner.shop.repository.ShopRepository;
import com.lastnyam.owner.shop.exception.ShopErrorCode;
import com.lastnyam.owner.shop.exception.ShopException;

import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShopService {

	private final OwnerRepository ownerRepository;
	private final ShopRepository shopRepository;
	private final MenuRepository menuRepository;
	private final FoodCategoryRepository foodCategoryRepository;

	@Transactional
	public ShopCreateResponse createShop(Integer ownerId, ShopCreateRequest request) {
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
			.shopDescription(request.getShopDescription())
			.shopBanner(request.getShopBanner())
			.shopCloses(request.getShopCloses())
			.shopPickupEndTime(request.getShopPickupEndTime())
			.foodCategory(category)
			.owner(owner)
			.build();

		shopRepository.save(shop);

		return ShopCreateResponse.builder()
			.shopId(shop.getShopId())
			.build();
	}

	@Transactional
	public MenuCreateResponse createMenu(Integer ownerId, Integer shopId, MenuCreateRequest request) {
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
	public MenuListResponse getShopMenus(Integer ownerId, Integer shopId) {
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
}
