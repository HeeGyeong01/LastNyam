package com.lastnyam.owner.owner.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.owner.owner.dto.OwnerDetailResponse;
import com.lastnyam.owner.owner.dto.OwnerRegisterRequest;
import com.lastnyam.owner.owner.dto.ShopListResponse;
import com.lastnyam.owner.owner.dto.TokenData;
import com.lastnyam.owner.owner.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner/auth")
@RequiredArgsConstructor
public class OwnerController {

    private final OwnerService ownerService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<TokenData>> register(@Valid @RequestBody OwnerRegisterRequest request) {
        ownerService.register(request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null));
    }

    // 점주 프로필 조회
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<OwnerDetailResponse>> getProfile(@AuthenticationPrincipal Integer userId) {
        OwnerDetailResponse ownerDetailResponse = ownerService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(ownerDetailResponse));
    }

    // 점주 가게 조회
    @GetMapping("/{ownerId}/shops")
    public ResponseEntity<ApiResponse<ShopListResponse>> getOwnerShops(
            @AuthenticationPrincipal Integer userId,
            @PathVariable("ownerId") Integer ownerId) {
        ShopListResponse result = ownerService.getOwnerShops(userId, ownerId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }
}
