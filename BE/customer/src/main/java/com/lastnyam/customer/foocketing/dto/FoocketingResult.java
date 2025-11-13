package com.lastnyam.customer.foocketing.dto;

import com.lastnyam.customer.global.dto.ShopInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingResult {

    private Integer rank;
    private ShopInfo shop;
    private String qrUrl;
}
