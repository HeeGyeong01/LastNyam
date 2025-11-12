package com.lastnyam.customer.foocketing.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingBriefInfo {

    private Integer foocketingId;
    private LocalDateTime openTime;
    private MenuInfo menu;
    private ShopInfo shop;





}
