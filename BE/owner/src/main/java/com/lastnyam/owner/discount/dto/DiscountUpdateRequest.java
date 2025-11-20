package com.lastnyam.owner.discount.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountUpdateRequest {
    private Integer discountPrice;
    private Integer discountMenuAmount;
}

