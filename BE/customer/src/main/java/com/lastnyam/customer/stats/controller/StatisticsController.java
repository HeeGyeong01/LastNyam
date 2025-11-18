package com.lastnyam.customer.stats.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.customer.stats.dto.SurvivedResponse;
import com.lastnyam.customer.stats.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 통계 관련 API 컨트롤러
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stats")
public class StatisticsController {

    private final StatisticsService statisticsService;

    /**
     * 가장 최근 탄소발자국 통계 조회
     *
     * @return 최근 통계 정보
     */
    @GetMapping("/survived")
    public ResponseEntity<ApiResponse<SurvivedResponse>> getLatestFootstep() {
        SurvivedResponse result = statisticsService.getLatestFootstep();
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }
}
