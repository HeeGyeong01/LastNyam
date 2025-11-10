package com.lastnyam.owner.transaction.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.owner.transaction.dto.TransactionDetailResponse;
import com.lastnyam.owner.transaction.dto.TransactionListResponse;
import com.lastnyam.owner.transaction.dto.TransactionStatusUpdateRequest;
import com.lastnyam.owner.transaction.dto.TransactionStatusUpdateResponse;
import com.lastnyam.owner.transaction.enums.TransactionType;
import com.lastnyam.owner.transaction.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner")
public class TransactionController {

    private final TransactionService transactionService;

    // 주문 상태 변경
    @PatchMapping("/{ownerId}/transaction/{transactionId}/status")
    public ResponseEntity<ApiResponse<TransactionStatusUpdateResponse>> updateTransactionStatus(
            @AuthenticationPrincipal Integer userId,
            @PathVariable("ownerId") Integer ownerId,
            @PathVariable("transactionId") Integer transactionId,
            @RequestBody TransactionStatusUpdateRequest request) {
        TransactionStatusUpdateResponse result = transactionService.updateTransactionStatus(userId, ownerId, transactionId, request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    // 주문 상세 조회
    @GetMapping("/{ownerId}/transaction/{transactionId}")
    public ResponseEntity<ApiResponse<TransactionDetailResponse>> getTransactionDetail(
            @AuthenticationPrincipal Integer userId,
            @PathVariable("ownerId") Integer ownerId,
            @PathVariable("transactionId") Integer transactionId,
            @RequestParam("type") TransactionType type) {
        TransactionDetailResponse result = transactionService.getTransactionDetail(userId, ownerId, transactionId, type);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }
    
    // 주문 상태 마감세일/푸켓팅 조회 (노쇼, 픽업완료 제외)
    @GetMapping("/{ownerId}/shop/{shopId}/transaction")
    public ResponseEntity<ApiResponse<TransactionListResponse>> getActiveTransactions(
            @AuthenticationPrincipal Integer userId,
            @PathVariable("ownerId") Integer ownerId,
            @PathVariable("shopId") Integer shopId) {
        TransactionListResponse result = transactionService.getActiveTransactions(userId, ownerId, shopId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }
}
