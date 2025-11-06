package com.lastnyam.customer.foocketing.dto;

import com.lastnyam.database.entity.Shop;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingDetail {

    private Integer foocketingId;
    private LocalDateTime openTime;
    private Integer maxAvailable;

    @Builder.Default
    private Integer currentViewing = 1;
    private DetailedMenuInfo menu;
    private ShopInfo shop;
}
