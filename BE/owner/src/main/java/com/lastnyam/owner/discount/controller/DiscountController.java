package com.lastnyam.owner.discount.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.owner.discount.dto.DiscountCreateRequest;
import com.lastnyam.owner.discount.dto.DiscountCreateResponse;
import com.lastnyam.owner.discount.dto.DiscountListResponse;
import com.lastnyam.owner.discount.dto.DiscountUpdateRequest;
import com.lastnyam.owner.discount.service.DiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner")
public class DiscountController {

    private final DiscountService discountService;

    // 마감세일 등록
    @PostMapping("/{ownerId}/shop/{shopId}/discount")
    public ResponseEntity<ApiResponse<DiscountCreateResponse>> createDiscount(
            @AuthenticationPrincipal Integer userId,
            @PathVariable("ownerId") Integer ownerId,
            @PathVariable("shopId") Integer shopId,
            @RequestBody DiscountCreateRequest request) {
        DiscountCreateResponse result = discountService.createDiscount(userId, ownerId, shopId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ofSuccess(result));
    }
    
    // 현재 진행중인 마감세일 조회
    @GetMapping("/{ownerId}/shop/{shopId}/discount")
    public ResponseEntity<ApiResponse<DiscountListResponse>> getActiveDiscounts(
            @AuthenticationPrincipal Integer userId,
            @PathVariable("ownerId") Integer ownerId,
            @PathVariable("shopId") Integer shopId) {
        DiscountListResponse result = discountService.getActiveDiscounts(userId, ownerId, shopId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    // 마감세일 수정
    @PatchMapping("/{ownerId}/shop/{shopId}/discount/{discountId}")
    public ResponseEntity<ApiResponse<Void>> updateDiscount(
            @AuthenticationPrincipal Integer userId,
            @PathVariable("ownerId") Integer ownerId,
            @PathVariable("shopId") Integer shopId,
            @PathVariable("discountId") Integer discountId,
            @RequestBody DiscountUpdateRequest request) {
        discountService.updateDiscount(userId, ownerId, shopId, discountId, request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null));
    }

    // 마감세일 삭제
    @DeleteMapping("/{ownerId}/shop/{shopId}/discount/{discountId}")
    public ResponseEntity<ApiResponse<Void>> deleteDiscount(
            @AuthenticationPrincipal Integer userId,
            @PathVariable("ownerId") Integer ownerId,
            @PathVariable("shopId") Integer shopId,
            @PathVariable("discountId") Integer discountId) {
        discountService.deleteDiscount(userId, ownerId, shopId, discountId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null));
    }
}
