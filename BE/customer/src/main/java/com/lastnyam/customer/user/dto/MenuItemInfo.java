package com.lastnyam.customer.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemInfo {
    private String menuName;
    private Integer price;
    private Integer quantity;
}
