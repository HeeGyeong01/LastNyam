package com.lastnyam.customer.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopDiscountItemDto {

	private Integer discountId;
	private String menuName;
	private Integer originalPrice;
	private Integer discountRate;
	private Integer price;
	private String menuImage;
	private String menuDescription;
	private Integer stock;
}



