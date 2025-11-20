package com.lastnyam.customer.foocketing.dto;

import com.lastnyam.customer.foocketing.enums.FoocketingResultStatus;
import com.lastnyam.customer.global.dto.ShopInfoWithMenu;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingSuccessResult extends FoocketingResult {
    private ShopInfoWithMenu shopInfo;

    public static FoocketingSuccessResult of(Integer rank, ShopInfoWithMenu menu) {
        FoocketingSuccessResult info = new FoocketingSuccessResult();

        info.setStatus(FoocketingResultStatus.SUCCESS);
        info.setRank(rank);
        info.setShopInfo(menu);
        return info;
    }
}
