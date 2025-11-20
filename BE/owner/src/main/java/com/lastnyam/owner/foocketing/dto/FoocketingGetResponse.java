package com.lastnyam.owner.foocketing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingGetResponse {
    private Integer foocketingId;
    private LocalDateTime foocketingTime;
    private Integer foocketingAmount;
    private LocalDateTime foocketingCloseTime;
    private LocalDateTime foocketingPickupEndTime;
    
    // 메뉴 정보
    private Integer menuId;
    private String menuName;
    private Integer menuPrice;
    private String menuImage;
}

