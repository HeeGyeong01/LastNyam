package com.lastnyam.customer.foocketing.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.customer.foocketing.dto.FoocketingDetail;
import com.lastnyam.customer.foocketing.dto.FoocketingResult;
import com.lastnyam.customer.foocketing.dto.FoocketingRecommendationInfo;
import com.lastnyam.customer.foocketing.service.FoocketingService;
import com.lastnyam.customer.foocketing.service.FoocketingRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/foocketing")
public class FoocketingController {


    private final FoocketingService foocketingService;
    private final FoocketingRecommendationService foocketingRecommendationService;

    @GetMapping("/{foocketingId}")
    public ResponseEntity<ApiResponse<FoocketingDetail>> getDetailOf(
            @RequestParam("lng") Double lng,
            @RequestParam("lat") Double lat,
            @PathVariable("foocketingId") Integer foocketingId) {

        FoocketingDetail detail = foocketingService.getDetailOf(lng, lat, foocketingId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(detail));
    }

    @GetMapping("/{foocketingId}/result")
    public ResponseEntity<ApiResponse<FoocketingResult>> getResultOf(
            @RequestParam("userId") Integer userId,
            @PathVariable("foocketingId") Integer foocketingId) {

        FoocketingResult result = foocketingService.getFoocketingResult(userId, foocketingId);

        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    @GetMapping("/recommendation/{userId}")
    public ResponseEntity<ApiResponse<?>> recommendFoocketings(@PathVariable("userId") Integer userId,
                                                               @RequestParam("lat") Double lat,
                                                               @RequestParam("lng") Double lng,
                                                               @RequestParam(value = "category", required = false) Integer categoryId) {
        java.util.List<FoocketingRecommendationInfo> recommendations =
                foocketingRecommendationService.recommend(userId, lat, lng, categoryId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(recommendations));
    }
}
