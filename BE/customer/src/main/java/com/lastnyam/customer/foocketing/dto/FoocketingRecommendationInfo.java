package com.lastnyam.customer.foocketing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingRecommendationInfo {

	private FoocketingBriefInfo foocketing;
	private boolean visitedShop;
	private boolean purchasedMenu;
}


