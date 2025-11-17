package com.lastnyam.customer.time.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.customer.time.dto.CurrentTimeResponse;
import java.time.Instant;
import java.time.ZoneId;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@NoArgsConstructor
@RequestMapping("/api/time")
public class TimeController {

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getCurrentServerTime() {
        Instant now = Instant.now().atZone(ZoneId.of("Asia/Seoul")).toInstant();
        return ResponseEntity.ok(ApiResponse.ofSuccess(new CurrentTimeResponse(now)));
    }
}
