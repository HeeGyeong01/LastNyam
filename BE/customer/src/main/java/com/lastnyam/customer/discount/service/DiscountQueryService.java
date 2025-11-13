package com.lastnyam.customer.discount.service;

import com.lastnyam.common.dto.CursorResponse;
import com.lastnyam.customer.discount.dto.DiscountBriefInfo;
import com.lastnyam.customer.discount.enums.DiscountSortType;
import com.lastnyam.customer.discount.repository.DiscountQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DiscountQueryService {

    private final DiscountQueryRepository queryRepository;

    public CursorResponse<DiscountBriefInfo> getDiscountsOf(DiscountSortType sort, Double lat, Double lng,
                                                            Integer categoryId, String cursor) {

        return queryRepository.findDiscountsNear(sort, lat, lng, categoryId, cursor);
    }

    public CursorResponse<DiscountBriefInfo> searchDiscountsOf(DiscountSortType sort, String keyword, Double lat,
                                                               Double lng, String cursor) {
        return queryRepository.searchDiscountsByKeyword(sort, keyword, lat, lng, cursor);
    }
}
