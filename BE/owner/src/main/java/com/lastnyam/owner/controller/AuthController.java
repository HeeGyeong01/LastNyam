package com.lastnyam.owner.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.owner.dto.OwnerRegisterRequest;
import com.lastnyam.owner.dto.TokenData;
import com.lastnyam.owner.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/owner/auth")
@RequiredArgsConstructor
public class AuthController {

    private final OwnerService ownerService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<TokenData>> register(@Valid @RequestBody OwnerRegisterRequest request) {
        ownerService.register(request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null));
    }
}
