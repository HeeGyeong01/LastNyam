package com.lastnyam.owner.report.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.owner.report.dto.ReportResponse;
import com.lastnyam.owner.report.service.ReportService;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/{ownerId}/report")
    public ApiResponse<?> getReport(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer ownerId, 
            @RequestParam(name = "shopId") Integer shopId) {

        ReportResponse response = reportService.getReport(userId, ownerId, shopId);

        return ApiResponse.ofSuccess(response);
    }
}
