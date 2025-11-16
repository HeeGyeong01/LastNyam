package com.lastnyam.customer.foocketing.dto;

import com.lastnyam.customer.global.dto.ShopInfoWithMenu;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingSuccessResult extends FoocketingResult {
    private ShopInfoWithMenu shopInfo;

    public static FoocketingSuccessResult of(Integer rank, ShopInfoWithMenu menu) {
        FoocketingSuccessResult info = new FoocketingSuccessResult();

        info.setSuccess(true);
        info.setRank(rank);
        info.setShopInfo(menu);
        return info;
    }
}
