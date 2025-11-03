package com.lastnyam.owner.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.owner.dto.OwnerLoginRequest;
import com.lastnyam.owner.dto.OwnerRegisterRequest;
import com.lastnyam.owner.dto.TokenData;
import com.lastnyam.owner.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final OwnerService ownerService;
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<TokenData>> register(@Valid @RequestBody OwnerRegisterRequest request) {
        try {
            ApiResponse<TokenData> response = ownerService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<TokenData> failResponse = ApiResponse.ofFail(400, e.getMessage());
            return ResponseEntity.badRequest().body(failResponse);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenData>> login(@Valid @RequestBody OwnerLoginRequest request) {
        try {
            ApiResponse<TokenData> response = ownerService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<TokenData> failResponse = ApiResponse.ofFail(400, e.getMessage());
            return ResponseEntity.badRequest().body(failResponse);
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenData>> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        try {
            String token = refreshToken.replace("Bearer ", "");
            ApiResponse<TokenData> response = ownerService.refreshToken(token);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<TokenData> failResponse = ApiResponse.ofFail(400, e.getMessage());
            return ResponseEntity.badRequest().body(failResponse);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Owner service is running");
    }
}
