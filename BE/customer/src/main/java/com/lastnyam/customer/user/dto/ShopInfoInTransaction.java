package com.lastnyam.customer.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopInfoInTransaction {
    private String shopName;
    private String shopBanner;
    private String openTime;
}
