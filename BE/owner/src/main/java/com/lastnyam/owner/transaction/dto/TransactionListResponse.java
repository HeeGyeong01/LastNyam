package com.lastnyam.owner.transaction.dto;

import com.lastnyam.database.entity.enums.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionListResponse {
    private List<TransactionDto> transactions;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionDto {
        private Integer transactionId;
        private TransactionStatus transactionStatus;
        private LocalDateTime createdAt;
        private String transactionType;
        private List<ItemDto> itemDtos;
        private Integer totalAmount;  // 트랜잭션 전체 합산금액
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemDto {
        private String menuName;
        private Integer menuPrice;
        private Integer amount;
        private Integer subtotal;  // 메뉴별 소합산금액 (menuPrice * amount)
    }
}

