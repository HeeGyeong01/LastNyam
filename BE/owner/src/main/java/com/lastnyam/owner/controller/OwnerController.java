package com.lastnyam.owner.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.owner.dto.*;
import com.lastnyam.owner.service.OrderService;
import com.lastnyam.owner.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner")
public class OwnerController {

    private final ShopService shopService;
    private final OrderService orderService;

    // 가게 등록
    @PostMapping("/{ownerId}/shops")
    public ResponseEntity<ApiResponse<ShopCreateResponseDto>> createShop(
            @PathVariable("ownerId") Integer ownerId,
            @RequestBody ShopCreateRequestDto request) {
        ShopCreateResponseDto result = shopService.createShop(ownerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ofSuccess(result));
    }

    // 메뉴 등록
    @PostMapping("/{ownerId}/shops/{shopId}/menus")
    public ResponseEntity<ApiResponse<MenuCreateResponseDto>> createMenu(
            @PathVariable("ownerId") Integer ownerId,
            @PathVariable("shopId") Integer shopId,
            @RequestBody MenuCreateRequestDto request) {
        MenuCreateResponseDto result = shopService.createMenu(ownerId, shopId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ofSuccess(result));
    }

    // 푸켓팅 등록
    @PostMapping("/{ownerId}/shops/{shopId}/fookectings")
    public ResponseEntity<ApiResponse<FookectingCreateResponseDto>> createFookecting(
            @PathVariable("ownerId") Integer ownerId,
            @PathVariable("shopId") Integer shopId,
            @RequestBody FookectingCreateRequestDto request) {
        FookectingCreateResponseDto result = shopService.createFookecting(ownerId, shopId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ofSuccess(result));
    }

    // 마감세일 등록
    @PostMapping("/{ownerId}/shops/{shopId}/discounts")
    public ResponseEntity<ApiResponse<DiscountCreateResponseDto>> createDiscount(
            @PathVariable("ownerId") Integer ownerId,
            @PathVariable("shopId") Integer shopId,
            @RequestBody DiscountCreateRequestDto request) {
        DiscountCreateResponseDto result = shopService.createDiscount(ownerId, shopId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ofSuccess(result));
    }

    // 주문 상태 변경
    @PatchMapping("/{ownerId}/order/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderStatusUpdateResponseDto>> updateOrderStatus(
            @PathVariable("ownerId") Integer ownerId,
            @PathVariable("orderId") Integer orderId,
            @RequestBody OrderStatusUpdateRequestDto request) {
        OrderStatusUpdateResponseDto result = orderService.updateOrderStatus(ownerId, orderId, request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }
}
