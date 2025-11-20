package com.lastnyam.foocketingpublisher.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.foocketingpublisher.dto.FoocketingEntryRequest;
import com.lastnyam.foocketingpublisher.dto.FoocketingEntryResponseDto;
import com.lastnyam.foocketingpublisher.service.EntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 푸켓팅 참여 API 컨트롤러
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/entry")
public class EntryController {

    private final EntryService entryService;

    /**
     * 푸켓팅 참여
     *
     * @param foocketingId 푸켓팅 ID
     * @param userId       JWT에서 추출한 사용자 ID
     * @return 성공 여부
     */
    @PostMapping("/foocketing/{foocketingId}")
    public ResponseEntity<ApiResponse<FoocketingEntryResponseDto>> entryFoocketing(
            @PathVariable("foocketingId") Integer foocketingId, @RequestBody FoocketingEntryRequest request) {

        FoocketingEntryResponseDto response = entryService.sendFoocketingEntry(foocketingId, request.getUserId());

        return ResponseEntity.ok(ApiResponse.ofSuccess(response));
    }
}

