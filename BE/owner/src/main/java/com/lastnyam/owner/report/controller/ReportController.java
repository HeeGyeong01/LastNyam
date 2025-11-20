package com.lastnyam.owner.report.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.owner.report.dto.DailyStatisticsResponse;
import com.lastnyam.owner.report.dto.ReportResponse;
import com.lastnyam.owner.report.service.DailyStatisticsQueryService;
import com.lastnyam.owner.report.service.ReportService;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner")
public class ReportController {

    private final ReportService reportService;
    private final DailyStatisticsQueryService dailyStatisticsQueryService;

    @GetMapping("/{ownerId}/report")
    public ApiResponse<?> getReport(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer ownerId, 
            @RequestParam(name = "shopId") Integer shopId) {

        ReportResponse response = reportService.getReport(userId, ownerId, shopId);

        return ApiResponse.ofSuccess(response);
    }

    @GetMapping("/{ownerId}/report/daily")
    public ApiResponse<DailyStatisticsResponse> getDailyStatistics(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer ownerId,
            @RequestParam(name = "shopId") Integer shopId,
            @RequestParam(name = "startDate", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // 권한 확인 (간단히 userId와 ownerId 비교)
        if (!userId.equals(ownerId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        // 기본값: 최근 7일
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(7);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        DailyStatisticsResponse response = dailyStatisticsQueryService
                .getDailyStatistics(shopId, startDate, endDate);

        return ApiResponse.ofSuccess(response);
    }
}
