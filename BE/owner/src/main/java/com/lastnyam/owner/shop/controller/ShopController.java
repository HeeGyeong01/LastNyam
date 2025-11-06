package com.lastnyam.owner.shop.controller;

import com.lastnyam.owner.shop.service.ShopService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.owner.shop.dto.MenuCreateRequest;
import com.lastnyam.owner.shop.dto.MenuCreateResponse;
import com.lastnyam.owner.shop.dto.MenuListResponse;
import com.lastnyam.owner.shop.dto.ShopCreateRequest;
import com.lastnyam.owner.shop.dto.ShopCreateResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner")
public class ShopController {

	private final ShopService shopService;

	// 가게 등록
	@PostMapping("/{ownerId}/shops")
	public ResponseEntity<ApiResponse<ShopCreateResponse>> createShop(
		@AuthenticationPrincipal Integer userId,
		@PathVariable("ownerId") Integer ownerId,
		@RequestBody ShopCreateRequest request) {
		ShopCreateResponse result = shopService.createShop(userId, ownerId, request);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ofSuccess(result));
	}

	// 메뉴 등록
	@PostMapping("/{ownerId}/shops/{shopId}/menus")
	public ResponseEntity<ApiResponse<MenuCreateResponse>> createMenu(
		@AuthenticationPrincipal Integer userId,
		@PathVariable("ownerId") Integer ownerId,
		@PathVariable("shopId") Integer shopId,
		@RequestBody MenuCreateRequest request) {
		MenuCreateResponse result = shopService.createMenu(userId, ownerId, shopId, request);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ofSuccess(result));
	}

	// 가게 메뉴 조회
	@GetMapping("/{ownerId}/shops/{shopId}/menus")
	public ResponseEntity<ApiResponse<MenuListResponse>> getShopMenus(
		@AuthenticationPrincipal Integer userId,
		@PathVariable("ownerId") Integer ownerId,
		@PathVariable("shopId") Integer shopId) {
		MenuListResponse result = shopService.getShopMenus(userId, ownerId, shopId);
		return ResponseEntity.ok(ApiResponse.ofSuccess(result));
	}

}
