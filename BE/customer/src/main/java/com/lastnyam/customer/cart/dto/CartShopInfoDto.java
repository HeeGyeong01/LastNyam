package com.lastnyam.customer.cart.dto;

import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartShopInfoDto {
	private Integer shopId;

	private String shopName;

	private String shopBanner;

	private LocalTime shopCloses;
}


