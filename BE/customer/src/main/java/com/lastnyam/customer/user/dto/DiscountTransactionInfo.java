package com.lastnyam.customer.user.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountTransactionInfo {
    private Integer transactionId;
    private ShopInfoInTransaction shop;
    private List<MenuItemInfo> menus;
    private Integer totalAmount;
}
