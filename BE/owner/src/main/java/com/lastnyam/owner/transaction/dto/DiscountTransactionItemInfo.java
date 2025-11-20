package com.lastnyam.owner.transaction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountTransactionItemInfo {

    private Integer menuId;
    private Integer categoryId;
    private Integer menuAmount;
}
