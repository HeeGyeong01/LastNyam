package com.lastnyam.foocketingpublisher.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.foocketingpublisher.dto.FoocketingEntryResponseDto;
import com.lastnyam.foocketingpublisher.service.EntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
     * @return 성공 여부
     */
    @PostMapping("/foocketing/{foocketingId}")
    public ResponseEntity<ApiResponse<FoocketingEntryResponseDto>> entryFoocketing(
            @PathVariable("foocketingId") Integer foocketingId) {
        
        FoocketingEntryResponseDto response = entryService.sendFoocketingEntry(foocketingId);
        
        return ResponseEntity.ok(ApiResponse.ofSuccess(response));
    }
}

