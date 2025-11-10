package com.lastnyam.owner.transaction.dto;

import com.lastnyam.database.entity.*;
import com.lastnyam.database.entity.enums.TransactionStatus;
import com.lastnyam.owner.transaction.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
    private String shopAddress;
    
    // 마감세일 주문 아이템 (마감세일인 경우에만)
    private List<DiscountTransactionItemDto> discountItems;
    
    // 푸켓팅 정보 (푸켓팅인 경우에만)
    private FoocketingDetailDto foocketingDetail;
    
    public static TransactionDetailResponse ofDiscount(DiscountTransaction transaction, List<DiscountTransactionItem> items) {
        User user = transaction.getUser();
        Shop shop = transaction.getShop();
        
        List<DiscountTransactionItemDto> itemDtos = items.stream()
                .map(DiscountTransactionItemDto::of)
                .collect(Collectors.toList());
        
        return TransactionDetailResponse.builder()
                .transactionId(transaction.getTransactionId())
                .transactionStatus(transaction.getTransactionStatus())
                .transactionQrImage(transaction.getTransactionQrImage())
                .createdAt(transaction.getCreatedAt())
                .transactionType(TransactionType.DISCOUNT.name())
                .userId(user.getUserId())
                .userNickname(user.getUserNickname())
                .userProfile(user.getUserProfile())
                .shopId(shop.getShopId())
                .shopName(shop.getShopName())
                .shopAddress(shop.getShopAddress())
                .discountItems(itemDtos)
                .build();
    }
    
    public static TransactionDetailResponse ofFoocketing(FoocketingTransaction transaction) {
        User user = transaction.getUser();
        Shop shop = transaction.getShop();
        Foocketing foocketing = transaction.getFoocketing();
        
        FoocketingDetailDto foocketingDetail = FoocketingDetailDto.of(foocketing);
        
        return TransactionDetailResponse.builder()
                .transactionId(transaction.getTransactionId())
                .transactionStatus(transaction.getTransactionStatus())
                .transactionQrImage(transaction.getTransactionQrImage())
                .createdAt(transaction.getCreatedAt())
                .transactionType(TransactionType.FOOCKETING.name())
                .userId(user.getUserId())
                .userNickname(user.getUserNickname())
                .userProfile(user.getUserProfile())
                .shopId(shop.getShopId())
                .shopName(shop.getShopName())
                .shopAddress(shop.getShopAddress())
                .foocketingDetail(foocketingDetail)
                .build();
    }
    
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
        
        public static DiscountTransactionItemDto of(DiscountTransactionItem item) {
            Discount discount = item.getDiscount();
            Menu menu = discount.getMenu();
            
            return DiscountTransactionItemDto.builder()
                    .transactionItemId(item.getTransactionItemId())
                    .transactionAmount(item.getTransactionAmount())
                    .discountId(discount.getDiscountId())
                    .discountRate(discount.getDiscountRate())
                    .discountPrice(discount.getDiscountPrice())
                    .menuId(menu.getMenuId())
                    .menuName(menu.getMenuName())
                    .menuPrice(menu.getMenuPrice())
                    .menuImage(menu.getMenuImage())
                    .build();
        }
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
        
        public static FoocketingDetailDto of(Foocketing foocketing) {
            Menu menu = foocketing.getMenu();
            
            return FoocketingDetailDto.builder()
                    .foocketingId(foocketing.getFoocketingId())
                    .foocketingTime(foocketing.getFoocketingTime())
                    .foocketingAmount(foocketing.getFoocketingAmount())
                    .menuId(menu.getMenuId())
                    .menuName(menu.getMenuName())
                    .menuPrice(menu.getMenuPrice())
                    .menuImage(menu.getMenuImage())
                    .build();
        }
    }
}

