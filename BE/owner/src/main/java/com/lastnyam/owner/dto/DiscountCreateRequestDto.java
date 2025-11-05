package com.lastnyam.owner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountCreateRequestDto {
    private LocalDate discountDate;
    private Integer discountRate;
    private Integer discountPrice;
    private Integer discountMenuAmount;
    private Integer menuId;
}
