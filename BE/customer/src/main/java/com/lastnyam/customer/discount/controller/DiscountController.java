package com.lastnyam.customer.discount.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.common.dto.CursorResponse;
import com.lastnyam.customer.discount.dto.DiscountBriefInfo;
import com.lastnyam.customer.discount.dto.DiscountRecommendationInfo;
import com.lastnyam.customer.discount.enums.DiscountSortType;
import com.lastnyam.customer.discount.service.DiscountRecommendationService;
import com.lastnyam.customer.discount.service.DiscountQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/discount")
public class DiscountController {

    private final DiscountQueryService queryService;
    private final DiscountRecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getDiscountList(@RequestParam("sort") DiscountSortType sort,
                                                          @RequestParam("lat") Double lat,
                                                          @RequestParam("lng") Double lng,
                                                          @RequestParam("category") Integer categoryId,
                                                          @RequestParam(value = "cursor", required = false) String cursor) {
        CursorResponse<DiscountBriefInfo> foocketingInfoList = queryService.getDiscountsOf(sort, lat, lng,
                categoryId, cursor);

        return ResponseEntity.ok(ApiResponse.ofSuccess(foocketingInfoList));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<?>> searchDiscount(@RequestParam("sort") DiscountSortType sort,
                                                         @RequestParam("lat") Double lat,
                                                         @RequestParam("lng") Double lng,
                                                         @RequestParam("keyword") String keyword,
                                                         @RequestParam(value = "cursor", required = false) String cursor) {

        CursorResponse<DiscountBriefInfo> foocketingInfoList = queryService.searchDiscountsOf(sort, keyword,
                lat, lng, cursor);
        return ResponseEntity.ok(ApiResponse.ofSuccess(foocketingInfoList));
    }

    @GetMapping("/recommendation/{userId}")
    public ResponseEntity<ApiResponse<?>> recommendDiscounts(@PathVariable("userId") Integer userId,
                                                             @RequestParam("lat") Double lat,
                                                             @RequestParam("lng") Double lng,
                                                             @RequestParam(value = "category", required = false) Integer categoryId) {
        java.util.List<DiscountRecommendationInfo> recommendations =
                recommendationService.recommend(userId, lat, lng, categoryId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(recommendations));
    }
}
