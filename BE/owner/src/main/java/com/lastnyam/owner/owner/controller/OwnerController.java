package com.lastnyam.owner.owner.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.owner.owner.dto.OwnerRegisterRequest;
import com.lastnyam.owner.owner.dto.ShopListResponse;
import com.lastnyam.owner.owner.dto.TokenData;
import com.lastnyam.owner.owner.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    // 점주 가게 조회
    @GetMapping("/{ownerId}/shops")
    public ResponseEntity<ApiResponse<ShopListResponse>> getOwnerShops(
            @PathVariable("ownerId") Integer ownerId) {
        ShopListResponse result = ownerService.getOwnerShops(ownerId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }
}
