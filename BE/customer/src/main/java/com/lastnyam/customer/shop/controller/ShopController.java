package com.lastnyam.customer.shop.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.customer.shop.dto.ShopDetailResponseDto;
import com.lastnyam.customer.shop.dto.ShopFavoriteRequestDto;
import com.lastnyam.customer.shop.dto.ShopFavoriteResponseDto;
import com.lastnyam.customer.shop.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/shop")
public class ShopController {

    private final ShopService shopService;

    @GetMapping("/{shopId}")
    public ResponseEntity<ApiResponse<ShopDetailResponseDto>> getShop(@PathVariable("shopId") Integer shopId) {
        ShopDetailResponseDto result = shopService.getShopDetail(shopId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    @PostMapping("/{shopId}/favorite")
    public ResponseEntity<ApiResponse<ShopFavoriteResponseDto>> favoriteShop(
            @PathVariable("shopId") Integer shopId,
            @RequestBody ShopFavoriteRequestDto request) {
        ShopFavoriteResponseDto result = shopService.addFavorite(shopId, request.getUserId());
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    @DeleteMapping("/{shopId}/favorite")
    public ResponseEntity<ApiResponse<ShopFavoriteResponseDto>> unfavoriteShop(
            @PathVariable("shopId") Integer shopId,
            @RequestBody ShopFavoriteRequestDto request) {
        ShopFavoriteResponseDto result = shopService.removeFavorite(shopId, request.getUserId());
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }
}


