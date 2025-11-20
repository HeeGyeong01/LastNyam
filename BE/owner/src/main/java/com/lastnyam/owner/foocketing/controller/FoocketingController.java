package com.lastnyam.owner.foocketing.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.owner.foocketing.dto.FoocketingCreateRequest;
import com.lastnyam.owner.foocketing.dto.FoocketingCreateResponse;
import com.lastnyam.owner.foocketing.dto.FoocketingListResponse;
import com.lastnyam.owner.foocketing.dto.FoocketingUpdateRequest;
import com.lastnyam.owner.foocketing.service.FoocketingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner")
public class FoocketingController {

    private final FoocketingService foocketingService;

    // 푸켓팅 등록
    @PostMapping("/{ownerId}/shop/{shopId}/foocketing")
    public ResponseEntity<ApiResponse<FoocketingCreateResponse>> createFoocketing(
            @AuthenticationPrincipal Integer userId,
            @PathVariable("ownerId") Integer ownerId,
            @PathVariable("shopId") Integer shopId,
            @RequestBody FoocketingCreateRequest request) {
        FoocketingCreateResponse result = foocketingService.createFoocketing(userId, ownerId, shopId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ofSuccess(result));
    }

    // 현재 진행중인 푸켓팅 조회
    @GetMapping("/{ownerId}/shop/{shopId}/foocketing")
    public ResponseEntity<ApiResponse<FoocketingListResponse>> getActiveFoocketings(
            @AuthenticationPrincipal Integer userId,
            @PathVariable("ownerId") Integer ownerId,
            @PathVariable("shopId") Integer shopId) {
        FoocketingListResponse result = foocketingService.getActiveFoocketings(userId, ownerId, shopId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    // 푸켓팅 수정
    @PatchMapping("/{ownerId}/shop/{shopId}/foocketing/{foocketingId}")
    public ResponseEntity<ApiResponse<Void>> updateFoocketing(
            @AuthenticationPrincipal Integer userId,
            @PathVariable("ownerId") Integer ownerId,
            @PathVariable("shopId") Integer shopId,
            @PathVariable("foocketingId") Integer foocketingId,
            @RequestBody FoocketingUpdateRequest request) {
        foocketingService.updateFoocketing(userId, ownerId, shopId, foocketingId, request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null));
    }

    // 푸켓팅 삭제
    @DeleteMapping("/{ownerId}/shop/{shopId}/foocketing/{foocketingId}")
    public ResponseEntity<ApiResponse<Void>> deleteFoocketing(
            @AuthenticationPrincipal Integer userId,
            @PathVariable("ownerId") Integer ownerId,
            @PathVariable("shopId") Integer shopId,
            @PathVariable("foocketingId") Integer foocketingId) {
        foocketingService.deleteFoocketing(userId, ownerId, shopId, foocketingId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null));
    }

}
