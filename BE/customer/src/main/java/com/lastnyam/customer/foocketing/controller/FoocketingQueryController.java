package com.lastnyam.customer.foocketing.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.customer.foocketing.dto.CursorResponse;
import com.lastnyam.customer.foocketing.dto.FoocketingBriefInfo;
import com.lastnyam.customer.foocketing.enums.SortType;
import com.lastnyam.customer.foocketing.service.FoocketingQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/foocketing")
public class FoocketingQueryController {

    private final FoocketingQueryService queryService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getFoocketingList(@RequestParam("sort") SortType sort,
                                                            @RequestParam("lat") Double lat,
                                                            @RequestParam("lng") Double lng,
                                                            @RequestParam(value = "cursor", required = false) String cursor) {
        CursorResponse<FoocketingBriefInfo> foocketingInfoList = queryService.getFoocketingsOf(sort, lat, lng, cursor);

        return ResponseEntity.ok(ApiResponse.ofSuccess(foocketingInfoList));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<?>> searchFoocketing(@RequestParam("sort") SortType sort,
                                                           @RequestParam("lat") Double lat,
                                                           @RequestParam("lng") Double lng,
                                                           @RequestParam("keyword") String keyword,
                                                           @RequestParam(value = "cursor", required = false) String cursor) {

        CursorResponse<FoocketingBriefInfo> foocketingInfoList = queryService.searchFoocketingsOf(sort, keyword,
                lat, lng, cursor);
        return ResponseEntity.ok(ApiResponse.ofSuccess(foocketingInfoList));
    }
}
