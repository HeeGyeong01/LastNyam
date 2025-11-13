package com.lastnyam.customer.foocketing.service;

import com.lastnyam.common.dto.CursorResponse;
import com.lastnyam.customer.foocketing.dto.FoocketingBriefInfo;
import com.lastnyam.customer.foocketing.enums.FoocketingSortType;
import com.lastnyam.customer.foocketing.repository.FoocketingQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FoocketingQueryService {


    private final FoocketingQueryRepository queryRepository;

    public CursorResponse<FoocketingBriefInfo> getFoocketingsOf(FoocketingSortType sort, Double lat, Double lng,
                                                                Integer categoryId, String cursor) {

        return queryRepository.findFoocketingsNear(sort, lat, lng, categoryId, cursor);
    }

    public CursorResponse<FoocketingBriefInfo> searchFoocketingsOf(FoocketingSortType sort, String keyword, Double lat,
                                                                   Double lng, String cursor) {
        return queryRepository.searchFoocketingsByKeyword(sort, keyword, lat, lng, cursor);
    }
}
