package com.lastnyam.customer.discount.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountCursorInfo {
    private Integer id;
    private Double distance;
    private Double rating;
    private Integer price;
    private Integer discountRate;
}
