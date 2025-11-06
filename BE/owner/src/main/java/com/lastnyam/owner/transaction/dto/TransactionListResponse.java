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
        
        public static TransactionDto ofDiscount(DiscountTransaction transaction, List<DiscountTransactionItem> items) {
            List<ItemDto> itemDtos = items.stream()
                    .map(ItemDto::ofDiscountItem)
                    .collect(Collectors.toList());
            
            Integer totalAmount = itemDtos.stream()
                    .mapToInt(ItemDto::getSubtotal)
                    .sum();
            
            return TransactionDto.builder()
                    .transactionId(transaction.getTransactionId())
                    .transactionStatus(transaction.getTransactionStatus())
                    .createdAt(transaction.getCreatedAt())
                    .transactionType(TransactionType.DISCOUNT.name())
                    .itemDtos(itemDtos)
                    .totalAmount(totalAmount)
                    .build();
        }
        
        public static TransactionDto ofFoocketing(FoocketingTransaction transaction) {
            Foocketing foocketing = transaction.getFoocketing();
            Menu menu = foocketing.getMenu();
            
            ItemDto itemDto = ItemDto.ofFoocketing(menu);
            Integer totalAmount = itemDto.getSubtotal();
            
            return TransactionDto.builder()
                    .transactionId(transaction.getTransactionId())
                    .transactionStatus(transaction.getTransactionStatus())
                    .createdAt(transaction.getCreatedAt())
                    .transactionType(TransactionType.FOOCKETING.name())
                    .itemDtos(List.of(itemDto))
                    .totalAmount(totalAmount)
                    .build();
        }
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
        
        public static ItemDto ofDiscountItem(DiscountTransactionItem item) {
            Integer menuPrice = item.getDiscount().getDiscountPrice();
            Integer amount = item.getTransactionAmount();
            Integer subtotal = menuPrice * amount;
            
            return ItemDto.builder()
                    .menuName(item.getDiscount().getMenu().getMenuName())
                    .menuPrice(menuPrice)
                    .amount(amount)
                    .subtotal(subtotal)
                    .build();
        }
        
        public static ItemDto ofFoocketing(Menu menu) {
            Integer menuPrice = menu.getMenuPrice();
            Integer amount = 1;
            Integer subtotal = menuPrice * amount;
            
            return ItemDto.builder()
                    .menuName(menu.getMenuName())
                    .menuPrice(menuPrice)
                    .amount(amount)
                    .subtotal(subtotal)
                    .build();
        }
    }
}

