package com.lastnyam.customer.foocketing.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingFailInfo {
    List<FoocketingBriefInfo> otherFoocketingsOfShop;
    List<FoocketingBriefInfo> recommendedFoocketings;
}
