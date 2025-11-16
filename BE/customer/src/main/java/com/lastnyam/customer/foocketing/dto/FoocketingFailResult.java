package com.lastnyam.customer.foocketing.dto;

import java.util.List;
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
public class FoocketingFailResult extends FoocketingResult {
    //limit 6
    List<FoocketingBriefInfo> otherFoocketingsOfShop;
    List<FoocketingBriefInfo> recommendedFoocketings;

    public static FoocketingFailResult of(Integer rank, FoocketingFailInfo failInfo) {
        FoocketingFailResult result = new FoocketingFailResult();

        result.setSuccess(false);
        result.setRank(rank);
        result.setOtherFoocketingsOfShop(failInfo.getOtherFoocketingsOfShop());
        result.setRecommendedFoocketings(failInfo.getRecommendedFoocketings());

        return result;
    }
}
