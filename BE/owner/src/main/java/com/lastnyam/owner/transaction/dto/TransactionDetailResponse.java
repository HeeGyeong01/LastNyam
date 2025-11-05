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
public class TransactionDetailResponse {
    private Integer transactionId;
    private TransactionStatus transactionStatus;
    private String transactionQrImage;
    private LocalDateTime createdAt;
    private String transactionType;
    
    // 사용자 정보
    private Integer userId;
    private String userNickname;
    private String userProfile;
    
    // 가게 정보
    private Integer shopId;
    private String shopName;
    
    // 마감세일 주문 아이템 (마감세일인 경우에만)
    private List<DiscountTransactionItemDto> discountItems;
    
    // 푸켓팅 정보 (푸켓팅인 경우에만)
    private FoocketingDetailDto foocketingDetail;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiscountTransactionItemDto {
        private Integer transactionItemId;
        private Integer transactionAmount;
        
        // 할인 정보
        private Integer discountId;
        private Integer discountRate;
        private Integer discountPrice;
        
        // 메뉴 정보
        private Integer menuId;
        private String menuName;
        private Integer menuPrice;
        private String menuImage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FoocketingDetailDto {
        private Integer foocketingId;
        private LocalDateTime foocketingTime;
        private Integer foocketingAmount;
        
        // 메뉴 정보
        private Integer menuId;
        private String menuName;
        private Integer menuPrice;
        private String menuImage;
    }
}

